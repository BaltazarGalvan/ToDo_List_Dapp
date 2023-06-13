import HashMap "mo:base/HashMap";
import Principal "mo:base/Principal";
import Text "mo:base/Text";
import Buffer "mo:base/Buffer";
import Iter "mo:base/Iter";
import Debug "mo:base/Debug";
import Types "Types";
import Result "mo:base/Result";
import Array "mo:base/Array";

actor class TodoList() {

  type ListProfile = Types.ListProfile;

  stable var preserveToDoList : [(Principal, [ListProfile])] = [];
  let toDoLists = HashMap.HashMap<Principal, [ListProfile]>(0, Principal.equal, Principal.hash);

  // regresa #err"No user Found" o #err "No list found" si encuentra list de usuario , regres #ok [items]
  func existList(listName : Text, listArrary : [ListProfile]) : Result.Result<[Text], Text> {
    let foundList = Array.find<ListProfile>(listArrary, func(list : ListProfile) { list.name == listName });
    switch (foundList) {
      case (null) {
        return #err("No List Found");
      };
      case (?listFound) {
        return #ok(listFound.items);
      };
    };
  };

  func existCaller(idPrincipal : Principal) : Result.Result<[ListProfile], Text> {
    let existListForCaller = toDoLists.get(idPrincipal);
    switch (existListForCaller) {
      case (null) {
        return #err("No User Found");
      };
      case (?existList) {
        return #ok(existList);
      };
    };
  };

  // para saber quien esta llamando al backend, regresa el caller
  public shared query ({ caller }) func whoAmI() : async Principal {
    return caller;
  };

  public shared ({ caller }) func addList(listName : Text) : async ListProfile {
    let foundUser = existCaller(caller);

    switch (foundUser) {
      case (#err(msg)) {
        let newList : ListProfile = { name = listName; items = [""] };
        toDoLists.put(caller, [newList]);
        return newList;
      };
      case (#ok(msg)) {
        let foundList = existList(listName, msg);
        let actualList = Buffer.fromArray<ListProfile>(msg);
        switch (foundList) {
          case (#err(msg)) {
            let newList : ListProfile = { name = listName; items = [] };
            actualList.add(newList);
            let newLists = Buffer.toArray<ListProfile>(actualList);
            toDoLists.put(caller, newLists);
            return newList;
          };
          case (#ok(msg)) {
            return { name = listName; items = msg };
          };
        };
      };
    };

  };

  // public shared ({ caller }) func addItem(listName : Text, item : Text) : async () {};

  public shared ({ caller }) func updateList(listName : Text, listItems : [Text]) : async Result.Result<[Text], Text> {
    try {
      let foundUser = existCaller(caller);
      switch (foundUser) {
        case (#err(msg)) {
          return #err(msg);
        };
        case (#ok(msg)) {
          let allLists = msg;
          let foundList = existList(listName, msg);
          switch (foundList) {
            case (#err(msg)) {
              return #err(msg);
            };
            case (#ok(msg)) {
              let allListMinusListArray = Array.filter<ListProfile>(allLists, func(list : ListProfile) { list.name != listName });
              let allListMinusListBuffer = Buffer.fromArray<ListProfile>(allListMinusListArray);
              let listToUpdate = { name = listName; items = listItems };
              allListMinusListBuffer.add(listToUpdate);
              let newList = Buffer.toArray(allListMinusListBuffer);
              toDoLists.put(caller, newList);
              return #ok(listItems);
            };
          };

        };
      };
    } catch (err) {
      return #err("err");
    };

  };

  public shared ({ caller }) func deleteList(listName : Text) : async Result.Result<Text, Text> {
    try {
      let foundUser = existCaller(caller);
      switch (foundUser) {
        case (#err(msg)) {
          return #err(msg);
        };
        case (#ok(msg)) {
          let restList = Array.filter<ListProfile>(msg, func(list) { list.name != listName });
          toDoLists.put(caller, restList);
          return #ok("");
        };
      };
    } catch (err) { return #err("Unexpected error") };
  };

  // public shared ({ caller }) func deleteItem(listName : Text, item : Nat) : () {};

  //regresa la lista de items contenida en un array, si es que existe en el registro
  public shared query ({ caller }) func getList(listName : Text) : async Result.Result<[Text], Text> {
    let foundUser = existCaller(caller);
    switch (foundUser) {
      case (#err(msg)) {
        return #err(msg);
      };
      case (#ok(msg)) {
        let foundList = existList(listName, msg);
        switch (foundList) {
          case (#err(msg)) {
            return #err(msg);
          };
          case (#ok(msg)) {
            return #ok(msg);
          };
        };
      };
    };
  };

  public shared query ({ caller }) func getAllLists() : async Result.Result<[ListProfile], Text> {
    let allListFromCaller = toDoLists.get(caller);
    switch (allListFromCaller) {
      case (null) {
        return #err("No List for this User");
      };
      case (?lists) {
        return #ok(lists);
      };
    };

  };

  public shared query ({ caller }) func getAllListNames() : async Result.Result<[Text], Text> {
    try {
      let foundUser = toDoLists.get(caller);
      switch (foundUser) {
        case (null) {
          return #err("No lists where found for this User");
        };
        case (?lists) {
          let listsBuffer = Buffer.Buffer<Text>(0);
          for (list in lists.vals()) {
            listsBuffer.add(list.name);
          };
          return #ok(Buffer.toArray(listsBuffer));
        };
      };
    } catch (err) {
      return #err("Unexpected error");
    };

  };

  // public shared ({caller}) func getAllListsTry():async Result.Result <[ListProfile], Text>{
  //   try{
  //     let allListFromCaller = toDoLists.get(caller);
  //     switch(allListFromCaller){
  //     case (null){
  //       return #err("No List for this User")
  //     };
  //     case(?lists){
  //       return #ok(lists);
  //     };
  //   };
  //   }catch(e){
  //     return #err("Unexpected Error")
  //   };
  // };

  //convierte los datos a array para hacerlos prevalecer durante el upgrade del canister
  system func preupgrade() {
    preserveToDoList := Iter.toArray(toDoLists.entries());
  };

  //recupera los datos despues del upgrade a su estructura de datos abitual, y borra el contenido del array que los hace prevalecer
  system func postupgrade() {
    for ((id, lists) in preserveToDoList.vals()) {
      toDoLists.put(id, lists);
    };
    preserveToDoList := [];
  };

};
