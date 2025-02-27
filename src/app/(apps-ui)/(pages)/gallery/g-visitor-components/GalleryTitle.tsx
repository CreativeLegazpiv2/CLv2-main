"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Icon } from "@iconify/react/dist/iconify.js";

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 }
};

const pageTransition = {
  type: "tween",
  ease: "anticipate",
  duration: 0.8
};

const staggerChildren = {
  animate: {
    transition: {
      staggerChildren: 0.2
    }
  }
};

const childVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 }
};

export const GalleryTitle = () => {
  return (
    <motion.div
      className="w-full pt-[5dvh] h-fit text-primary-2 relative"
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageVariants}
      transition={pageTransition}
    >
       {/* Decorative elements */}
       <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute top-0 right-0 w-full h-64 bg-palette-2/30 -skew-y-6 translate-y-20 transform-gpu"></div>
        <div className="absolute bottom-0 left-0 w-full h-64 bg-palette-1/20 -skew-y-6 -translate-y-32 transform-gpu"></div>
      </div>
      
      {/* Floating decorative shapes */}
      <div className="absolute w-32 h-32 md:w-48 md:h-48 rounded-full border-4 border-palette-2/10 top-20 -left-16 opacity-60"></div>
      <div className="absolute w-40 h-40 md:w-64 md:h-64 rounded-full border-4 border-palette-1/10 -bottom-20 -right-20 opacity-60"></div>
      <div className="absolute w-24 h-24 rotate-45 border-2 border-palette-2/10 top-40 right-20 opacity-60"></div>

      <div className="w-full lg:max-w-[70%] md:max-w-[80%] max-w-[90%] mx-auto py-[10dvh]">
        <motion.div className="w-full flex flex-col justify-center items-center gap-6 text-palette-2" variants={staggerChildren}>
          <motion.div
            className="w-full flex flex-col-reverse md:flex-row gap-4 md:justify-center justify-start items-start"
            variants={childVariants}
          >
            <h1 className="w-fit text-left inline-block text-5xl md:text-6xl lg:text-7xl font-bold text-palette-1 relative z-10 capitalizes ">
              Creativ<span className='text-palette-2'>e</span> gallery
            </h1>
          </motion.div>
          <motion.div
            className="w-full flex flex-col gap-8 justify-center items-center"
            variants={childVariants}
          >
            <p className='text-base  font-thin w-full max-w-xl text-center'>
              Creative Legazpi is a vibrant hub of creativity that brings together
              a diverse range of artistic and cultural disciplines.
            </p>
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
};  

export default GalleryTitle;
