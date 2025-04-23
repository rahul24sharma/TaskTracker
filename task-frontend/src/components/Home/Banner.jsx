import React, { useState } from "react";

const Banner = ({

}) => {
  return (
    <>
      <div className="max-w-screen-2xl container mx-auto xl:px-24 px-4 md:py-20 py-14">
        <h1 className="text-5xl font-bold text-primary mb-3">
          Start your <span className="text-blue">task tracking</span> journey
          today
        </h1>
        <p className="text-lg text-black/70 mb-8">
          Organize your tasks, track progress, and stay productive with a tool
          built to streamline your workflow and boost your efficiency.
        </p>
      </div>
    </>
  );
};

export default Banner;
