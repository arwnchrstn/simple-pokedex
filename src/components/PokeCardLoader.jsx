import React from "react";

const PokeCardLoader = () => {
  return (
    <>
      <div className="container">
        <div className="row my-3 gap-2 gap-md-3 justify-content-center">
          {Array(18)
            .fill(0)
            .map((num, idx) => (
              <div
                key={idx}
                className="col-auto d-flex flex-column pokemon-card-loader rounded border border-2"
              >
                {/* Pokemon ID */}
                <div className="d-flex justify-content-between py-3">
                  <div className="poke-id-loader"></div>
                </div>

                {/* Pokemon image */}
                <div className="poke-image-loader mx-auto my-2"></div>

                {/* Pokemon name */}
                <div className="poke-name-loader rounded mb-1"></div>

                {/* Pokemon type */}
                <div className="mt-1 d-flex justify-content-center">
                  <div className="poke-type-loader-1 rounded mx-1"></div>
                  <div className="poke-type-loader-2 rounded mx-1"></div>
                </div>
              </div>
            ))}
        </div>
      </div>
    </>
  );
};

export default PokeCardLoader;
