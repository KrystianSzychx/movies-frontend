import React from 'react';
import Hero from '../hero/Hero';

const Home = ({ movies }) => {
  return (
    <div>
      {movies ? <Hero movies={movies} /> : <p>Loading...</p>}
      {/* Dodatkowa zawartość strony */}
    </div>
  );
};

export default Home;
