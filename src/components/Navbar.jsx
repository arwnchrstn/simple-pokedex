import React, { useState, useContext } from "react";
import { TbPokeball } from "react-icons/tb";
import { Link } from "react-router-dom";
import { PokemonContext } from "../context/PokemonContext";
import { Modal } from "react-bootstrap";
import { useEffect } from "react";

const Navbar = () => {
  const { pokemonState, pokemonDispatch } = useContext(PokemonContext);
  const [showAbout, setShowAbout] = useState(() =>
    pokemonState.modalShowAboutStatus ? false : true
  );
  const [promptInstall, setPromptInstall] = useState(null);

  const handleHideAbout = () => {
    setShowAbout(false);
    pokemonDispatch({ type: "SET_MODAL_STATUS", payload: true });
  };

  //Trigger install prompt
  const handleInstall = (evt) => {
    evt.preventDefault();
    if (!promptInstall) {
      return;
    }
    promptInstall.prompt();
  };

  useEffect(() => {
    const handler = async (e) => {
      e.preventDefault();
      pokemonDispatch({ type: "SET_PWA_COMPATIBILITY", payload: true });
      setPromptInstall(e);
    };
    window.addEventListener("beforeinstallprompt", handler);

    return () => window.removeEventListener("transitionend", handler);
  }, []);

  return (
    <>
      <header className="bg-danger text-white">
        <nav className="navbar">
          <div className="container">
            <Link
              to="/"
              className="navbar-brand text-white fw-bold m-0 d-flex align-items-center"
            >
              <TbPokeball className="me-1 fs-3" /> Pokedex
            </Link>

            <p
              className="m-0 fs-5 fw-bold"
              onClick={() => setShowAbout(true)}
              onFocus={(e) => e.target.blur()}
              style={{ cursor: "pointer" }}
            >
              About
            </p>
          </div>
        </nav>
      </header>

      <Modal show={showAbout} onHide={handleHideAbout}>
        <Modal.Header className="justify-content-center">
          <p className="fw-bold m-0">About React JS Pokedex</p>
        </Modal.Header>
        <Modal.Body>
          {pokemonState.isPwaCompatible && (
            <button
              className="btn btn-danger mx-auto d-block fw-bold"
              onClick={handleInstall}
            >
              Install App
            </button>
          )}
          <p className="m-0 mt-4">
            This project serves as a practice to further ehnance my skills in
            web development
          </p>
          <hr />
          <p className="m-0 mt-4">
            This simple pokedex does not include all information about your
            pokemon. This is solely for{" "}
            <span className="text-danger fw-bold">
              educational and entertainment purposes
            </span>{" "}
            only. The pokedex only include information about the pokemon:{" "}
          </p>
          <ul className="mt-3">
            <li>Names and Pokemon Images</li>
            <li>Types</li>
            <li>Base Stats and Abilities</li>
            <li>Type Relations</li>
            <li>Evolutions and</li>
            <li>Pokemon Varieties</li>
          </ul>
          <hr />
          <p className="m-0 mt-4">
            The pokedex does not work offline, so all data in this pokedex are
            coming from{" "}
            <a
              href="http://pokeapi.co"
              className="text-danger fw-bold"
              target="_blank"
              rel="noreferrer"
            >
              PokeAPI
            </a>{" "}
            which serves all of the pokemon data.
          </p>
          <hr />
          <p className="text-danger m-0 mt-4 fs-5 text-decoration-underline fw-bold">
            Disclaimer:{" "}
          </p>
          <p className="m-0 mt-3">
            This is not related or affiliated to the Pokemon Company in any way.
            All images used in this app belongs to the rightful owner.
          </p>
          <p className="m-0 mt-3">No Copyright Infringement Intended.</p>
          <p className="m-0 mt-5">Arwen Christian Ceres</p>
          <span>-Developer</span>
          <hr />
          <p className="text-center m-0">
            To access the github repository,{" "}
            <a
              href="https://github.com/arwnchrstn/simple-pokedex.git"
              target="_blank"
              rel="noreferrer"
              className="text-danger fw-bold"
            >
              Click Here
            </a>
          </p>
        </Modal.Body>
        <Modal.Footer className="justify-content-center">
          <button
            className="btn btn-danger px-5 fs-5 fw-bold"
            onClick={handleHideAbout}
          >
            Close
          </button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default Navbar;
