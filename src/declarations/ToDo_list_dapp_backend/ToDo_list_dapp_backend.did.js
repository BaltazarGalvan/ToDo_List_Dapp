export const idlFactory = ({ IDL }) => {
  const ListProfile = IDL.Record({
    'name' : IDL.Text,
    'items' : IDL.Vec(IDL.Text),
  });
  const Result = IDL.Variant({ 'ok' : IDL.Vec(IDL.Text), 'err' : IDL.Text });
  const Result_1 = IDL.Variant({
    'ok' : IDL.Vec(ListProfile),
    'err' : IDL.Text,
  });
  const TodoList = IDL.Service({
    'addList' : IDL.Func([IDL.Text], [ListProfile], []),
    'deleteGroupOfLists' : IDL.Func([IDL.Vec(IDL.Text)], [IDL.Text], []),
    'getAllListNames' : IDL.Func([], [Result], ['query']),
    'getAllLists' : IDL.Func([], [Result_1], ['query']),
    'getList' : IDL.Func([IDL.Text], [Result], ['query']),
    'updateList' : IDL.Func([IDL.Text, IDL.Vec(IDL.Text)], [Result], []),
    'whoAmI' : IDL.Func([], [IDL.Principal], ['query']),
  });
  return TodoList;
};
export const init = ({ IDL }) => { return []; };
