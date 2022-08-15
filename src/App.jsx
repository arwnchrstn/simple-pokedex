import React, { Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import pokeball from "./assets/pokeball.png";
import { AnimatePresence, motion } from "framer-motion";
import { PokemonProvider } from "./context/PokemonContext";
const HomePokedex = React.lazy(() => import("./pages/HomePokedex"));
const PokemonInfo = React.lazy(() => import("./pages/PokemonInfo"));

function App() {
  const loader = (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="main-wrapper d-flex justify-content-center align-items-center text-center"
      >
        <motion.div
          animate={{ opacity: [0, 1, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <h1 className="fw-bold">Loading</h1>
          <motion.img
            animate={{ rotate: 360 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            src={pokeball}
            alt="pokeball"
            width="80"
          />
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );

  return (
    <PokemonProvider>
      <Suspense fallback={loader}>
        <Routes>
          <Route path="/" index exact element={<HomePokedex />} />
          <Route path="/pokemon/:pokemon_id" exact element={<PokemonInfo />} />
        </Routes>
      </Suspense>
    </PokemonProvider>
  );
}

export default App;
