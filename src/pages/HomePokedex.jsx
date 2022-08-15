import React from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import PokemonCards from "../components/PokemonCards";

const HomePokedex = () => {
  return (
    <div className="main-wrapper d-flex flex-column bg-light">
      <Navbar />
      <PokemonCards />
      <Footer />
    </div>
  );
};

export default HomePokedex;
