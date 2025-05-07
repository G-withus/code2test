//Slice, Selectors, Thunks (future async actions) ကို centralized export လုပ်မယ်။

import selectedItemReducer, { setSelectedItem } from "./selectedItemSlice";
import { selectSelectedItem } from "./selectedItemSelectors";

export { setSelectedItem, selectSelectedItem };
export default selectedItemReducer;
