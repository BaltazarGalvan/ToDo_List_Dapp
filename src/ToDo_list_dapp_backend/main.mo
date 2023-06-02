import HashMap "mo:base/HashMap";
import Principal "mo:base/Principal";
import Text "mo:base/Text";
import Buffer "mo:base/Buffer";
import Iter "mo:base/Iter";
import Debug "mo:base/Debug";
import Types "Types";
import Result "mo:base/Result";
import Array "mo:base/Array";


actor class TodoList(){

  type ListProfile = Types.ListProfile;

  stable var preserveToDoList : [(Principal, [ListProfile])]=[];
  let toDoLists = HashMap.HashMap<Principal,[ListProfile]>(0, Principal.equal, Principal.hash);
  
  // regresa #err"No user Found" o #err "No list found" si encuentra list de usuario , regres #ok [items]
  func existList (listName: Text, listItems : [ListProfile]):  Result.Result<[Text], Text>{
    let foundList =  Array.find<ListProfile>(listItems, func (list: ListProfile) {list.name == listName;});
    switch(foundList){
      case (null){
        return #err("No List Found")
      };
      case (?listFound){
        return #ok(listFound.items);
      };
    };
  }; 

  func existCaller (idPrincipal: Principal) : Result.Result<[ListProfile], Text> {
    let existListForCaller = toDoLists.get(idPrincipal);
    switch(existListForCaller){
      case(null){
          return #err("No User Found")
      };
      case(?existList){
        return #ok(existList);
      };
    };
  };

  // para saber quien esta llamando al backend, regresa el caller
  public shared query ({caller}) func whoAmI(): async Principal{
    return caller;
  };

  public shared ({caller}) func addList(listName: Text):async ListProfile{
    let foundUser =  existCaller(caller);
    
    switch(foundUser){
      case (#err(msg)){
        let newList: ListProfile= {name=listName; items=[""]};
        toDoLists.put(caller, [newList]);
        return newList;
      };
      case(#ok(msg)){
        let foundList = existList(listName,msg);
        let actualList = Buffer.fromArray<ListProfile>(msg);
        switch(foundList){
          case (#err(msg)){
            let newList: ListProfile= {name=listName; items=[""]};
            actualList.add(newList);
            let newLists= Buffer.toArray<ListProfile>(actualList);
            toDoLists.put(caller, newLists);
            return newList;
          };
          case (#ok(msg)){
            return {name = listName; items=msg};
          };
        };
      };
    };

  };
  
  //regresa la lista de items contenida en un array, si es que existe en el registro
  public shared  query ({caller}) func getList (listName:Text): async Result.Result<[Text],Text>{
    let foundUser = existCaller(caller);
    switch(foundUser){
      case(#err(msg)){
        return #err(msg);
      };
      case(#ok(msg)){
        let foundList =  existList(listName, msg);
        switch(foundList) {
          case(#err(msg)) {
            return#err(msg);
          };
          case(#ok(msg)) { 
            return #ok(msg);
          };
        };
      };
    };

    // let foundList =  existList(caller, listName);
    // switch (foundList){
    //   case(#err(msg)){
    //     return #err(msg);
    //   };
    //   case(#ok(msg)){
    //     return #ok(msg);
    //   };
    // };

  }; 

  public shared query ({caller}) func getAllLists (): async Result.Result<[ListProfile], Text>{
    let allListFromCaller = toDoLists.get(caller);
    switch(allListFromCaller){
      case (null){
        return #err("No List for this User")
      };
      case(?lists){
        return #ok(lists);
      };
    };
    
  };

  //convierte los datos a array para hacerlos prevalecer durante el upgrade del canister
  system func preupgrade(){
    preserveToDoList := Iter.toArray(toDoLists.entries());
  };
  
  //recupera los datos despues del upgrade a su estructura de datos abitual, y borra el contenido del array que los hace prevalecer
  system func postupgrade(){
    for((id, lists) in preserveToDoList.vals()){
        toDoLists.put(id, lists);
    };
    preserveToDoList := [];
  };

  
};