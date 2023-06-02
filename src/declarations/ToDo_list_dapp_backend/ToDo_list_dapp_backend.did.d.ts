import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';

export interface ListProfile { 'name' : string, 'items' : Array<string> }
export type Result = { 'ok' : Array<string> } |
  { 'err' : string };
export type Result_1 = { 'ok' : Array<ListProfile> } |
  { 'err' : string };
export interface TodoList {
  'addList' : ActorMethod<[string], ListProfile>,
  'getAllLists' : ActorMethod<[], Result_1>,
  'getList' : ActorMethod<[string], Result>,
  'whoAmI' : ActorMethod<[], Principal>,
}
export interface _SERVICE extends TodoList {}
