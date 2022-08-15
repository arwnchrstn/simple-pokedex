import React, { useEffect, useRef, useContext } from "react";
import styled from "styled-components";
import { typeColors } from "../config/types";
import { api } from "../api/api";
import {
  BsFillArrowLeftCircleFill,
  BsFillArrowRightCircleFill
} from "react-icons/bs";
import { Link } from "react-router-dom";
import PokeCardLoader from "./PokeCardLoader";
import pokeball from "../assets/pokeball.png";
import spinner from "../assets/spinner_loader.gif";
import axios from "axios";
import SearchBar from "./SearchBar";
import { Helmet, HelmetProvider } from "react-helmet-async";
import { PokemonContext } from "../context/PokemonContext";

//styled p for displaying pokemon type
const PokemonType = styled.p`
  font-size: 15px;
  display: inline;
  background-color: ${(props) => props.bg};
`;

const PokemonCards = () => {
  const { pokemonState, pokemonDispatch } = useContext(PokemonContext);
  const loadPokemon = useRef();

  //Load all pokemon details
  loadPokemon.current = async () => {
    pokemonDispatch({
      type: "SET_POKEMON_LIST",
      payload: []
    });
    try {
      pokemonDispatch({ type: "SET_LOADING", payload: true });
      const response = await axios.get(pokemonState.currentApi);
      const data = await response.data;

      const promises = data.results.map(async (result) => {
        const response = await axios.get(
          api.POKEMON + result.url.split("/").at(-2)
        );
        const data = await response.data;

        return data;
      });

      pokemonDispatch({
        type: "SET_POKEMON_LIST",
        payload: await Promise.all(promises)
      });
      pokemonDispatch({ type: "SET_NEXT_API", payload: data.next });
      pokemonDispatch({
        type: "SET_CURRENT_API",
        payload: pokemonState.currentApi
      });
      pokemonDispatch({ type: "SET_PREV_API", payload: data.previous });
    } catch (e) {
      console.error(e);
      alert(e.message);
    }
    pokemonDispatch({ type: "SET_LOADING", payload: false });
  };

  useEffect(() => {
    let isMounted = true;

    if (isMounted) loadPokemon.current();

    return () => {
      isMounted = false;
    };
  }, [pokemonState.currentApi]);

  return (
    <>
      <HelmetProvider>
        <Helmet>
          <title>Pokedex</title>
        </Helmet>
      </HelmetProvider>

      <div className="container">
        {/* Search form */}
        <SearchBar />

        {/* Next and prev button */}
        <div className="row mt-3 mb-4">
          <div className="col-6">
            {/* Prev button */}
            {pokemonState.prevApi && (
              <button
                className="btn btn-danger form-control fw-bold"
                onClick={() =>
                  pokemonDispatch({
                    type: "SET_CURRENT_API",
                    payload: pokemonState.prevApi
                  })
                }
                onFocus={(e) => e.target.blur()}
              >
                <BsFillArrowLeftCircleFill /> Previous
              </button>
            )}
          </div>

          <div className="col-6">
            {/* Next button */}
            {pokemonState.nextApi && (
              <button
                className="btn btn-danger form-control fw-bold"
                onClick={() =>
                  pokemonDispatch({
                    type: "SET_CURRENT_API",
                    payload: pokemonState.nextApi
                  })
                }
                onFocus={(e) => e.target.blur()}
              >
                Next <BsFillArrowRightCircleFill />
              </button>
            )}
          </div>
        </div>

        {pokemonState.isLoading && <PokeCardLoader />}
        <div className="row my-3 gap-2 gap-md-3 justify-content-center">
          {pokemonState.list
            .sort((a, b) => a.id - b.id)
            .map((pokemon) => (
              <div
                key={pokemon.id}
                className="col-auto pokemon-card rounded border border-2 text-center"
              >
                {/* Pokemon id */}
                <p className="m-0 mt-2 fs-6 text-start">#{pokemon.id}</p>

                <Link
                  className="text-white text-decoration-none"
                  to={`/pokemon/${pokemon.id}`}
                >
                  {/* Pokemon image */}
                  <img
                    className="pokemon-image img-fluid pokemon-sprite"
                    src={spinner}
                    alt={pokemon.name}
                    height="96px"
                    width="96px"
                    onLoad={(e) =>
                      e.target.setAttribute(
                        "src",
                        pokemon.sprites.front_default ||
                          pokemon.sprites.other["official-artwork"]
                            .front_default ||
                          pokeball
                      )
                    }
                  />

                  {/* Pokemon name */}
                  <p className="text-center text-white bg-danger text-uppercase rounded m-0 mb-1">
                    {pokemon.name}
                  </p>
                </Link>

                <>
                  {/* Pokemon type */}
                  <PokemonType
                    bg={typeColors[pokemon.types[0].type.name]}
                    className=" m-0 rounded text-uppercase align-self-center text-white px-1 me-1"
                  >
                    {pokemon.types[0].type.name}
                  </PokemonType>

                  {pokemon.types[1] && (
                    <PokemonType
                      bg={typeColors[pokemon.types[1].type.name]}
                      className=" m-0 rounded text-uppercase align-self-center text-white px-1"
                    >
                      {pokemon.types[1].type.name}
                    </PokemonType>
                  )}
                </>
              </div>
            ))}
        </div>
      </div>
    </>
  );
};

export default PokemonCards;
