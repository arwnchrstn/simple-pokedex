import React, { useState, useEffect, useRef, useContext } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { Link, useParams } from "react-router-dom";
import {
  BsArrowLeftCircleFill,
  BsFillQuestionCircleFill,
  BsArrowDownCircleFill,
  BsArrowRightCircleFill
} from "react-icons/bs";
import { api } from "../api/api";
import { typeColors } from "../config/types";
import { Modal } from "react-bootstrap";
import { motion } from "framer-motion";
import { PokemonContext } from "../context/PokemonContext";
import { Helmet, HelmetProvider } from "react-helmet-async";
import axios from "axios";
import styled from "styled-components";
import pokeball from "../assets/pokeball.png";
import spinner from "../assets/spinner_loader.gif";
import ReactTooltip from "react-tooltip";

const PokeBackground = styled.div`
  background-image: linear-gradient(
    90deg,
    ${(props) => props.firstcolor},
    ${(props) => (props.secondcolor ? props.secondcolor : props.firstcolor)}
  );
`;

const PokemonType = styled.p`
  display: inline;
  font-size: 17px;
  background-color: ${(props) => props.bg};
  transition: box-shadow 0.3s ease-out;

  &:hover {
    box-shadow: 0px 0px 30px 0px ${(props) => props.bg};
    -webkit-box-shadow: 0px 0px 30px 0px ${(props) => props.bg};
    -moz-box-shadow: 0px 0px 30px 0px ${(props) => props.bg};
    transition: box-shadow 0.3s ease-out;
    cursor: pointer;
  }
`;

const PokemonInfo = () => {
  const FOOT_CONVERSION = 3.28084;
  const POUND_CONVERSION = 2.20462;
  const EGG_CYCLE = 257;
  const { pokemonState } = useContext(PokemonContext);
  const { pokemon_id } = useParams();
  const [pokeInfo, setPokeInfo] = useState();
  const [loading, setLoading] = useState();
  const [show, setShow] = useState(false);
  const [showSpriteModal, setShowSpriteModal] = useState(false);
  const [ability, setAbility] = useState(null);
  const [isShiny, setIsShiny] = useState(false);
  const [isError, setIsError] = useState(null);
  const loadPokemon = useRef();

  //Show ability modal
  const showAbilityModal = (e) => {
    setAbility(
      ...pokeInfo.abilities.filter(
        (ability) =>
          ability.name === e.currentTarget.getAttribute("ability-name")
      )
    );
    setShow(true);
  };
  //Hide ability modal
  const hideAbilityModal = () => {
    setShow(false);
    setTimeout(() => {
      setAbility(null);
    }, 200);
  };

  //Pokemon ability info
  const getAbility = (ability) => {
    const abilities = ability.map(async (abilities) => {
      const response = await axios.get(abilities.ability.url);
      const data = await response.data;

      return data;
    });

    return abilities;
  };

  //Pokemon species info
  const getSpeciesInfo = async (url) => {
    const response = await axios.get(url);
    const data = await response.data;

    return data;
  };

  //Get weakness and strength
  const damageRelation = async (types) => {
    return types.map(async (pokemon) => {
      const response = await axios.get(api.POKEMON_TYPE + pokemon.type.name);
      const data = response.data;

      return data.damage_relations;
    });
  };

  //Get pokemon varieties
  const pokemonVarieties = async (varieties) => {
    const variety = varieties.map(async (variety) => {
      const response = await axios.get(variety.pokemon.url);
      const data = await response.data;

      return data;
    });

    return variety;
  };

  //Get pokemon evolution
  const getEvolution = async (evolution) => {
    const response = await axios.get(evolution);
    const data = await response.data;
    const evolutionChain = [];
    let hasEvolution = [];

    //Get first form
    const firstEvolution = async () => {
      const response = await axios.get(
        data.chain.species.url.replaceAll("pokemon-species", "pokemon")
      );
      const pokemon = response.data;

      return pokemon;
    };
    evolutionChain.push([await firstEvolution()]);
    hasEvolution = data.chain.evolves_to || [];

    while (hasEvolution.length !== 0) {
      const evolution = hasEvolution.map(async (evolution) => {
        const response = await axios.get(
          evolution.species.url.replaceAll("pokemon-species", "pokemon")
        );
        const pokemon = await response.data;

        return pokemon;
      });

      evolutionChain.push(await Promise.all(evolution));
      hasEvolution = hasEvolution[0].evolves_to || [];
    }

    return evolutionChain;
  };

  //Load selected pokemon
  loadPokemon.current = async (id) => {
    setPokeInfo(undefined);
    setLoading(true);
    try {
      const response =
        pokemonState.list.filter((pokemon) => pokemon.id === parseInt(id))[0] ||
        (await axios.get(api.POKEMON + id));
      const data = response.data || response;
      const abilities = await Promise.all(await getAbility(data.abilities));
      const speciesData = await getSpeciesInfo(data.species.url);
      const varieties = await Promise.all(
        await pokemonVarieties(speciesData.varieties)
      );
      const evolutions = await getEvolution(speciesData.evolution_chain.url);
      const typeEffectiveness = await Promise.all(
        await damageRelation(data.types)
      );
      let doubleDamageFrom = new Set();
      let doubleDamageTo = new Set();
      let halfDamageFrom = new Set();
      let halfDamageTo = new Set();
      let noDamageFrom = new Set();
      let noDamageTo = new Set();

      //fetching type relations
      typeEffectiveness.forEach((type) => {
        type.double_damage_from.map((type) => doubleDamageFrom.add(type.name));
        type.double_damage_to.map((type) => doubleDamageTo.add(type.name));
        type.half_damage_from.map((type) => halfDamageFrom.add(type.name));
        type.half_damage_to.map((type) => halfDamageTo.add(type.name));
        type.no_damage_from.map((type) => noDamageFrom.add(type.name));
        type.no_damage_to.map((type) => noDamageTo.add(type.name));
      });

      //adding filters to remove unwanted mismatch in types
      setPokeInfo({
        ...speciesData,
        ...data,
        type_effectiveness: {
          dbl_damage_from: [
            ...[...doubleDamageFrom].filter(
              (type) =>
                ![...noDamageFrom].includes(type) &&
                ![...halfDamageFrom].includes(type)
            )
          ],
          dbl_damage_to: [
            ...[...doubleDamageTo].filter(
              (type) => ![...noDamageTo].includes(type)
            )
          ],
          half_damage_from: [
            ...[...halfDamageFrom].filter(
              (type) =>
                ![...noDamageFrom].includes(type) &&
                ![...doubleDamageFrom].includes(type)
            )
          ],
          half_damage_to: [
            ...[...halfDamageTo].filter(
              (type) =>
                ![...noDamageTo].includes(type) &&
                ![...doubleDamageTo].includes(type)
            )
          ],
          no_damage_from: [...noDamageFrom]
        },
        varieties,
        abilities,
        evolutions
      });
    } catch (e) {
      setIsError({
        error_message: e.response.data
      });
      console.error(e.response.data + " - " + e.response.status);
    }
    setLoading(false);
  };

  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "smooth"
    });
    let isMounted = true;

    if (isMounted) loadPokemon.current(pokemon_id);

    return () => {
      isMounted = false;
    };
  }, [pokemon_id]);

  return (
    <>
      <HelmetProvider>
        <Helmet>
          <title>{`Pokedex ${
            pokeInfo?.name.toUpperCase()
              ? `| ${pokeInfo?.name.toUpperCase()}`
              : ""
          }`}</title>
        </Helmet>
      </HelmetProvider>

      <div className="main-wrapper d-flex flex-column bg-light">
        <Navbar />
        {loading && (
          <div className="d-flex align-items-center justify-content-center mt-4">
            <h1 className="m-0 me-2 fw-bold">Loading... </h1>
            <motion.img
              animate={{ rotate: 360 }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
              src={pokeball}
              alt="pokeball"
              width="40"
            />
          </div>
        )}
        {isError ? (
          <div className="container m-auto text-center">
            <BsFillQuestionCircleFill className="mb-3 text-danger error-icon" />{" "}
            <p className="fs-4">{isError.error_message}</p>
            <p className="fs-5">Oops, We Can't Find Your Pokemon :&#40;</p>
            <Link to="/" role="button" className="btn btn-sm btn-danger px-3">
              Search Other Pokemon
            </Link>
          </div>
        ) : (
          <div className="container my-4">
            {pokeInfo && (
              <>
                {/* Background header */}
                <PokeBackground
                  firstcolor={typeColors[pokeInfo.types[0].type.name]}
                  secondcolor={
                    typeColors[
                      pokeInfo.types[1]
                        ? pokeInfo.types[1].type.name
                        : pokeInfo.types[0].type.name
                    ]
                  }
                  className="pokemon-header rounded"
                >
                  <div className="row px-3 pt-3">
                    <Link to={"/"} className="text-white fs-3">
                      <BsArrowLeftCircleFill />
                    </Link>
                  </div>

                  <div className="pokemon-header_image d-flex justify-content-center align-items-center">
                    {isShiny && (
                      <img
                        className="img-fluid bg-light border border-2 border-dark rounded p-2"
                        src={spinner}
                        onLoad={(e) =>
                          e.target.setAttribute(
                            "src",
                            pokeInfo.sprites.other.home.front_shiny || pokeball
                          )
                        }
                        alt={pokeInfo.name}
                        onClick={() => setShowSpriteModal(true)}
                        style={{ cursor: "pointer" }}
                      />
                    )}
                    {!isShiny && (
                      <img
                        className="img-fluid bg-light border border-2 border-dark rounded p-2"
                        src={spinner}
                        onLoad={(e) =>
                          e.target.setAttribute(
                            "src",
                            pokeInfo.sprites.other.home.front_default ||
                              pokeball
                          )
                        }
                        alt={pokeInfo.name}
                        onClick={() => setShowSpriteModal(true)}
                        style={{ cursor: "pointer" }}
                      />
                    )}
                  </div>
                </PokeBackground>

                {/* Pokemon name and type*/}
                <div className="row mt-5 pt-5">
                  <h2 className="text-uppercase text-center mt-2 fw-bold">
                    #{pokeInfo.id} {pokeInfo.name}
                  </h2>

                  <div className="text-center">
                    <PokemonType
                      bg={typeColors[pokeInfo.types[0].type.name]}
                      className="fw-bold text-uppercase px-3 rounded text-white mx-1"
                    >
                      {pokeInfo.types[0].type.name}
                    </PokemonType>

                    {pokeInfo.types[1] && (
                      <PokemonType
                        bg={typeColors[pokeInfo.types[1].type.name]}
                        className="fw-bold text-uppercase px-3 rounded text-white mx-1"
                      >
                        {pokeInfo.types[1].type.name}
                      </PokemonType>
                    )}
                  </div>

                  <h5 className="text-center m-0 my-3">
                    {pokeInfo.generation.name.replaceAll("-", " ")} Pokemon
                  </h5>

                  <button
                    className="btn btn-danger btn-sm w-auto mx-auto"
                    onClick={() => setIsShiny((prev) => !prev)}
                    onFocus={(e) => e.target.blur()}
                  >
                    {isShiny ? "View Normal Form" : "View Shiny Form"}
                  </button>
                </div>

                {/* 1st row - Stats and abilities */}
                <div className="container">
                  <div className="row mt-4">
                    {/* Base stats */}
                    <div className="col-12 col-md-6 border border-2 rounded d-flex flex-column justify-content-center py-3 px-4">
                      <div className="d-flex align-items-center justify-content-center mb-3">
                        <img
                          src={pokeball}
                          className="img-fluid me-1"
                          alt="pokeball"
                          width="23"
                        />
                        <p className="m-0 text-center fw-bold fs-5">
                          BASE STATS
                        </p>
                      </div>
                      <ReactTooltip place="top" type="dark" effect="solid" />
                      <div className="row text-center">
                        {pokeInfo.stats.map((pokemon, idx) => (
                          <div key={idx} className="col-12 mb-3">
                            <p className="fs-6 fw-bold text-uppercase m-0">
                              {pokemon.stat.name.replaceAll("-", " ")}
                            </p>
                            <div className="progress">
                              <div
                                className="progress-bar progress-bar-striped progress-bar-animated bg-danger"
                                role="progressbar"
                                style={{
                                  width: `${(pokemon.base_stat / 255) * 100}%`
                                }}
                                data-tip={`${pokemon.stat.name
                                  .replaceAll("special", "sp")
                                  .replaceAll("attack", "atk")
                                  .replaceAll("defense", "def")
                                  .replaceAll("speed", "spd")
                                  .replaceAll("-", ". ")}: ${
                                  pokemon.base_stat
                                }`}
                                aria-valuenow={pokemon.base_stat}
                                aria-valuemin="0"
                                aria-valuemax="255"
                              ></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Abilities */}
                    <div className="col-12 col-md-6 mt-4 mt-md-0 py-3 px-4">
                      <p className="m-0 mb-4 text-center text-sm-start text-danger fw-bold">
                        "
                        {(pokeInfo.flavor_text_entries &&
                          pokeInfo.flavor_text_entries
                            .find((text) => text.language.name === "en")
                            .flavor_text.replaceAll("\f", " ")
                            .replaceAll("é", "e")) ||
                          "Loading..."}
                        "
                      </p>

                      <div className="d-flex align-items-center justify-content-center mb-2">
                        <img
                          src={pokeball}
                          className="img-fluid me-1"
                          alt="pokeball"
                          width="23"
                        />
                        <p className="m-0 text-center fw-bold fs-5">
                          Abilities
                        </p>
                      </div>
                      <ol className="d-flex align-items-center flex-column m-0 mb-4">
                        {pokeInfo.abilities.length === 0 && (
                          <p className="m-0">No data to show</p>
                        )}
                        {pokeInfo.abilities.map((ability, idx) => (
                          <li key={idx}>
                            <p className="m-0">
                              {ability.name.replaceAll("-", " ")}{" "}
                              <BsFillQuestionCircleFill
                                className="ms-1 fs-4 pb-1 ability-details text-danger"
                                ability-name={ability.name}
                                onClick={showAbilityModal}
                              />
                            </p>
                          </li>
                        ))}
                      </ol>

                      <div className="d-flex align-items-center justify-content-center mb-2">
                        <img
                          src={pokeball}
                          className="img-fluid me-1"
                          alt="pokeball"
                          width="23"
                        />
                        <p className="m-0 text-center fw-bold fs-5">
                          Other Info
                        </p>
                      </div>
                      <div className="row">
                        <div className="col-sm-6 col-md-12 col-lg-6">
                          <p className="fs-6 text-uppercase mb-2">
                            Base Experience: {pokeInfo.base_experience}
                          </p>
                        </div>

                        <div className="col-sm-6 col-md-12 col-lg-6">
                          <p className="fs-6 text-uppercase mb-2">
                            Base Happiness: {pokeInfo.base_happiness}
                          </p>
                        </div>

                        <div className="col-sm-6 col-md-12 col-lg-6">
                          <p className="fs-6 text-uppercase mb-2">
                            Height: {pokeInfo.height / 10} M (
                            {((pokeInfo.height / 10) * FOOT_CONVERSION).toFixed(
                              1
                            )}{" "}
                            ft)
                          </p>
                        </div>

                        <div className="col-sm-6 col-md-12 col-lg-6">
                          <p className="fs-6 text-uppercase mb-2">
                            Weight: {pokeInfo.weight / 10} KG (
                            {(
                              (pokeInfo.weight / 10) *
                              POUND_CONVERSION
                            ).toFixed(1)}{" "}
                            lbs)
                          </p>
                        </div>

                        <div className="col-sm-6 col-md-12 col-lg-6">
                          <p className="fs-6 text-uppercase mb-2">
                            Habitat:{" "}
                            {pokeInfo.habitat?.name.replaceAll("-", " ") ||
                              "No Habitat"}
                          </p>
                        </div>

                        <div className="col-sm-6 col-md-12 col-lg-6">
                          <p className="fs-6 text-uppercase mb-2">
                            Egg Groups:{" "}
                            {pokeInfo.egg_groups?.map((eg, idx) => (
                              <span key={idx}>
                                {idx !== 0 && ", "}
                                {eg.name.replaceAll("-", " ")}
                              </span>
                            ))}
                          </p>
                        </div>

                        <div className="col-sm-6 col-md-12 col-lg-6">
                          <p className="fs-6 text-uppercase mb-2">
                            Growth Rate:{" "}
                            {pokeInfo.growth_rate?.name.replaceAll("-", " ")}
                          </p>
                        </div>

                        <div className="col-sm-6 col-md-12 col-lg-6">
                          <p className="fs-6 text-uppercase mb-2">
                            Egg Cycle: {pokeInfo.hatch_counter} (
                            {`${(
                              pokeInfo.hatch_counter * EGG_CYCLE
                            ).toLocaleString("en-US")} Steps`}
                            )
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 2nd row - Damage relations */}
                  <div className="row mt-4">
                    <div className="d-flex align-items-center">
                      <img
                        src={pokeball}
                        className="img-fluid me-1"
                        alt="pokeball"
                        width="23"
                      />
                      <p className="m-0 text-center fw-bold fs-5">
                        Type Effectiveness
                      </p>
                    </div>

                    {/* Double damage */}
                    <div className="col-md-6 col-xl-4 p-3">
                      <h6 className="m-0 my-2 text-decoration-underline fw-bold">
                        Super Effective From
                      </h6>
                      <div className="d-flex flex-wrap gap-2">
                        {pokeInfo.type_effectiveness.dbl_damage_from.length ===
                          0 && <p className="m-0">-None</p>}
                        {pokeInfo.type_effectiveness.dbl_damage_from.map(
                          (type, idx) =>
                            (pokeInfo.abilities.filter(
                              (ability) => ability.name === "levitate"
                            ).length !== 0 &&
                              type === "ground") || (
                              <PokemonType
                                key={idx}
                                bg={typeColors[type]}
                                className="m-0 fw-bold text-uppercase px-3 rounded text-white"
                              >
                                {type}
                              </PokemonType>
                            )
                        )}
                      </div>

                      <h6 className="m-0 mt-4 mb-2 text-decoration-underline fw-bold">
                        Super Effective To
                      </h6>
                      <div className="d-flex flex-wrap gap-2">
                        {pokeInfo.type_effectiveness.dbl_damage_to.length ===
                          0 && <p className="m-0">-None</p>}
                        {pokeInfo.type_effectiveness.dbl_damage_to.map(
                          (type, idx) => (
                            <PokemonType
                              key={idx}
                              bg={typeColors[type]}
                              className="m-0 fw-bold text-uppercase px-3 rounded text-white"
                            >
                              {type}
                            </PokemonType>
                          )
                        )}
                      </div>
                    </div>

                    {/* Half Damage */}
                    <div className="col-md-6 col-xl-4 p-3">
                      <h6 className="m-0 my-2 text-decoration-underline fw-bold">
                        Not Very Effective From
                      </h6>

                      <div className="d-flex flex-wrap gap-2">
                        {pokeInfo.type_effectiveness.half_damage_from.length ===
                          0 && <p className="m-0">-None</p>}
                        {pokeInfo.type_effectiveness.half_damage_from.map(
                          (type, idx) => (
                            <PokemonType
                              key={idx}
                              bg={typeColors[type]}
                              className="m-0 fw-bold text-uppercase px-3 rounded text-white d-inline"
                            >
                              {type}
                            </PokemonType>
                          )
                        )}
                      </div>

                      <h6 className="m-0 mt-4 mb-2 text-decoration-underline fw-bold">
                        Not Very Effective To
                      </h6>
                      <div className="d-flex flex-wrap gap-2">
                        {pokeInfo.type_effectiveness.half_damage_to.length ===
                          0 && <p className="m-0">-None</p>}
                        {pokeInfo.type_effectiveness.half_damage_to.map(
                          (type, idx) => (
                            <PokemonType
                              key={idx}
                              bg={typeColors[type]}
                              className="m-0 fw-bold text-uppercase px-3 rounded text-white d-inline"
                            >
                              {type}
                            </PokemonType>
                          )
                        )}
                      </div>
                    </div>

                    {/* No Damage */}
                    <div className="col-md-6 col-xl-4 p-3">
                      <h6 className="m-0 my-2 text-decoration-underline fw-bold">
                        No Damage From (Immune)
                      </h6>

                      <div className="d-flex flex-wrap gap-2">
                        {pokeInfo.type_effectiveness.no_damage_from.length ===
                          0 &&
                          pokeInfo.abilities.filter(
                            (ability) => ability.name === "levitate"
                          ).length === 0 && <p className="m-0">-None</p>}

                        {pokeInfo.abilities.filter(
                          (ability) => ability.name === "levitate"
                        ).length !== 0 && (
                          <p className="m-0">
                            -Immune from ground attacks due to its ability
                            (Levitate)
                          </p>
                        )}

                        {pokeInfo.type_effectiveness.no_damage_from.map(
                          (type, idx) => (
                            <PokemonType
                              key={idx}
                              bg={typeColors[type]}
                              className="m-0 fw-bold text-uppercase px-3 rounded text-white d-inline"
                            >
                              {type}
                            </PokemonType>
                          )
                        )}
                      </div>
                    </div>
                  </div>

                  {/* 3rd row - Evolutions */}
                  <div className="row mt-3 justify-content-center">
                    <div className="d-flex align-items-center">
                      <img
                        src={pokeball}
                        className="img-fluid me-1"
                        alt="pokeball"
                        width="23"
                      />
                      <p className="m-0 text-center fw-bold fs-5">Evolution</p>
                    </div>
                    {pokeInfo.evolutions.length === 1 && (
                      <p className="m-0 text-center fw-bold">
                        This pokemon does not evolve
                      </p>
                    )}

                    <div className="d-flex justify-content-center align-items-center flex-column flex-lg-row gap-3">
                      {pokeInfo.evolutions.map((evolution, idx) => (
                        <React.Fragment key={idx}>
                          {idx !== 0 && (
                            <>
                              <BsArrowRightCircleFill
                                className="d-none d-lg-block"
                                size={40}
                              />
                              <BsArrowDownCircleFill
                                className="d-block d-lg-none"
                                size={40}
                              />
                            </>
                          )}
                          <div
                            className="d-flex flex-column flex-md-row flex-wrap gap-3 justify-content-center align-items-center border border-2 p-2 rounded"
                            key={idx}
                            style={{ maxWidth: "800px" }}
                          >
                            {evolution.map((pokemon, idx) => (
                              <div
                                className="d-flex flex-column justify-content-center"
                                style={{
                                  width: "180px",
                                  aspectRatio: "4/5"
                                }}
                                key={idx}
                              >
                                <Link
                                  className="text-decoration-none"
                                  type="button"
                                  to={`/pokemon/${pokemon.species.url
                                    .split("/")
                                    .at(-2)}`}
                                >
                                  <img
                                    className="img-fluid pokemon-form"
                                    src={spinner}
                                    onLoad={(e) =>
                                      e.target.setAttribute(
                                        "src",
                                        pokemon.sprites.other.home
                                          .front_default || pokeball
                                      )
                                    }
                                    alt={pokemon.name}
                                  />
                                  <p className="m-0 mt-4 bg-danger text-white rounded text-center px-3 d-block">
                                    {pokemon.name.replaceAll("-", " ")}
                                  </p>
                                </Link>
                              </div>
                            ))}
                          </div>
                        </React.Fragment>
                      ))}
                    </div>
                  </div>

                  {/* 4th row - Varieties */}
                  <div className="row gap-2 mt-4 justify-content-center">
                    <div className="d-flex align-items-center">
                      <img
                        src={pokeball}
                        className="img-fluid me-1"
                        alt="pokeball"
                        width="23"
                      />
                      <p className="m-0 text-center fw-bold fs-5">Varieties</p>
                    </div>
                    {pokeInfo.varieties.length === 1 && (
                      <p className="m-0 text-center fw-bold">
                        This pokemon has no other varieties
                      </p>
                    )}

                    <div className="d-flex flex-wrap gap-3 justify-content-center align-items-stretch">
                      {pokeInfo.varieties.map((variety, idx) => (
                        <div
                          className="d-flex flex-column justify-content-center border border-2 p-2 rounded"
                          style={{
                            width: "180px",
                            aspectRatio: "4/5"
                          }}
                          key={idx}
                        >
                          <Link
                            className="text-decoration-none"
                            role="button"
                            to={`/pokemon/${variety.id}`}
                          >
                            <img
                              src={spinner}
                              onLoad={(e) =>
                                e.target.setAttribute(
                                  "src",
                                  variety.sprites.other.home.front_default ||
                                    pokeball
                                )
                              }
                              className="img-fluid pokemon-form align-self-center"
                              alt={variety.name}
                            />
                            <p className="m-0 mt-4 bg-danger text-white rounded d-block text-center px-3">
                              {variety.name.replaceAll("-", " ")}
                            </p>
                          </Link>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
        <Footer />
      </div>

      {/* Ability Modal */}
      <Modal
        className="ability-modal"
        show={show}
        onHide={hideAbilityModal}
        centered
      >
        <Modal.Body>
          <>
            <div className="d-flex align-items-center justify-content-center">
              <img
                src={pokeball}
                className="img-fluid"
                alt="pokeball"
                width="35"
                height="35"
              />
              <h3 className="m-0 ms-2">{ability?.name.replaceAll("-", " ")}</h3>
            </div>

            <p className="mt-4 text-center fs-6">
              {ability?.flavor_text_entries
                .find((effect) => effect.language.name === "en")
                .flavor_text.replaceAll("é", "e")}
            </p>
          </>

          <button
            className="btn btn-danger mt-4 mx-auto d-block"
            onClick={hideAbilityModal}
          >
            Close
          </button>
        </Modal.Body>
      </Modal>

      {/* Pokemon different sprites modal */}
      <Modal show={showSpriteModal} onHide={() => setShowSpriteModal(false)}>
        <Modal.Body>
          {!isShiny && (
            <img
              src={pokeInfo?.sprites.other.home.front_default}
              alt={pokeInfo?.name}
              className="img-fluid"
            />
          )}

          {isShiny && (
            <img
              src={pokeInfo?.sprites.other.home.front_shiny}
              alt={pokeInfo?.name}
              className="img-fluid"
            />
          )}

          <button
            className="btn btn-danger form-control mt-5"
            onClick={() => setShowSpriteModal(false)}
          >
            Close
          </button>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default PokemonInfo;
