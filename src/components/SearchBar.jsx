import React, { useState, useContext } from "react";
import { PokemonContext } from "../context/PokemonContext";
import { Link } from "react-router-dom";

const SearchBar = () => {
  const { pokemonState } = useContext(PokemonContext);
  const [searchValue, setSearchValue] = useState("");
  const [showSuggestion, setShowSuggestion] = useState(false);
  const searchFilter = pokemonState.names
    ?.filter((pokemon) => pokemon.name.includes(searchValue.toLowerCase()))
    .slice(0, 10);

  return (
    <form onSubmit={(e) => e.preventDefault()}>
      <div className="mt-3 position-relative">
        <input
          className="form-control"
          type="text"
          placeholder="Search Pokemon"
          name="search-pokemon"
          value={searchValue}
          onChange={(e) => {
            setSearchValue(e.target.value.trim());
            setShowSuggestion(true);
          }}
        />

        <div
          className={`searchSuggestions position-absolute rounded w-100 m-0 ${
            showSuggestion && searchValue ? "d-block" : "d-none"
          }`}
        >
          <ul className="m-0 p-0">
            {searchFilter?.length !== 0 ? (
              searchFilter?.map((pokemon, idx) => (
                <Link
                  to={`/pokemon/${pokemonState.names
                    .filter((link) => link.name === pokemon.name)[0]
                    ?.url.split("/")
                    .at(-2)}`}
                  key={idx}
                  className="text-dark text-decoration-none"
                >
                  <li className="py-2 px-3">{pokemon.name}</li>
                </Link>
              ))
            ) : (
              <li className="py-2 px-3">No match found</li>
            )}
          </ul>
        </div>
      </div>
    </form>
  );
};

export default SearchBar;
