import { createContext, useContext, useState } from "react";

const Context = createContext();

export function Provider({ children }) {

  const [name, setName] = useState("bidule");

  return (
    <Context.Provider value={{ name, setName }}>
      {children}
    </Context.Provider>
  );
}

export const MyContext = () => useContext(Context);
