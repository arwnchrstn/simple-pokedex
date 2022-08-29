import { useEffect } from "react";
import { createContext, useReducer } from "react";
import { api } from "../api/api";
import { pokemon_reducer } from "../reducer/pokemon_reducer";
import axios from "axios";

export const PokemonContext = createContext({});

export const PokemonProvider = ({ children }) => {
  const [pokemonState, pokemonDispatch] = useReducer(pokemon_reducer, {
    list: [],
    isLoading: undefined,
    names: undefined,
    currentApi: api.POKEMON_SPECIES,
    prevApi: null,
    nextApi: null,
    modalAboutShowStatus: false,
    isPwaCompatible: false
  });

  useEffect(() => {
    let isMounted = true;

    if (!pokemonState.names && isMounted) {
      (async () => {
        const response = await axios.get(
          api.POKEMON_SPECIES.replace("90", "9999")
        );
        const data = await response.data.results;

        const names = data.map((pokemon) => pokemon);
        pokemonDispatch({ type: "SET_POKEMON_NAMES", payload: names });
      })();
    }

    return () => {
      isMounted = false;
    };
  }, [pokemonState.names]);

  return (
    <PokemonContext.Provider value={{ pokemonState, pokemonDispatch }}>
      {children}
    </PokemonContext.Provider>
  );
};
