import { motion } from "framer-motion";
import Image from "next/image";

export const VisionMission = () => {
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3,
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { 
        type: "spring", 
        damping: 15, 
        stiffness: 80 
      }
    }
  };

  return (
    <section className="relative py-24 overflow-hidden bg-gradient-to-br from-palette-5 to-palette-5/90">
      {/* Decorative elements */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute top-0 right-0 w-full h-64 bg-palette-2/30 -skew-y-6 translate-y-20 transform-gpu"></div>
        <div className="absolute bottom-0 left-0 w-full h-64 bg-palette-1/20 -skew-y-6 -translate-y-32 transform-gpu"></div>
      </div>
      
      {/* Floating decorative shapes */}
      <div className="absolute w-32 h-32 md:w-48 md:h-48 rounded-full border-4 border-palette-2/10 top-20 -left-16 opacity-60"></div>
      <div className="absolute w-40 h-40 md:w-64 md:h-64 rounded-full border-4 border-palette-1/10 -bottom-20 -right-20 opacity-60"></div>
      <div className="absolute w-24 h-24 rotate-45 border-2 border-palette-2/10 top-40 right-20 opacity-60"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          className="max-w-7xl mx-auto"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={containerVariants}
        >
          {/* Section header with creative design */}
          <motion.div 
            className="relative mb-16 text-center"
            variants={itemVariants}
          >
            <span className="block text-xs uppercase tracking-widest text-palette-2 font-medium mb-2">Our Foundation</span>
            <h2 className="inline-block text-5xl md:text-6xl lg:text-7xl font-bold text-palette-1 relative z-10">
              Vision <span className="text-palette-2">&</span> Mission
            </h2>
            <div className="h-1 w-24 bg-palette-2 mx-auto mt-6"></div>
            
            {/* Decorative elements behind title */}
            <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 text-9xl font-black text-palette-1/5 whitespace-nowrap select-none">
              PURPOSE
            </div>
          </motion.div>

          <div className="flex flex-col lg:flex-row gap-16 items-stretch">
            {/* Vision Card */}
            <motion.div
              className="flex-1 relative group"
              variants={itemVariants}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-palette-2/5 to-palette-2/20 rounded-2xl transform rotate-1 group-hover:rotate-0 transition-transform duration-500"></div>
              <div className="relative z-10 p-8 lg:p-10 border border-palette-2/20 rounded-2xl backdrop-blur-sm bg-white/5 h-full">
                {/* Decorative icon */}
                <div className="w-16 h-16 mb-6 rounded-full bg-palette-2/10 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 text-palette-2">
                    <path d="M12 15a3 3 0 100-6 3 3 0 000 6z" />
                    <path fillRule="evenodd" d="M1.323 11.447C2.811 6.976 7.028 3.75 12.001 3.75c4.97 0 9.185 3.223 10.675 7.69.12.362.12.752 0 1.113-1.487 4.471-5.705 7.697-10.677 7.697-4.97 0-9.186-3.223-10.675-7.69a1.762 1.762 0 010-1.113zM17.25 12a5.25 5.25 0 11-10.5 0 5.25 5.25 0 0110.5 0z" clipRule="evenodd" />
                  </svg>
                </div>
                
                <h3 className="font-bold text-3xl md:text-4xl text-palette-2 mb-4 flex items-center">
                  Our Vision
                  <div className="ml-3 h-px bg-palette-2/30 flex-grow"></div>
                </h3>
                
                <p className="text-lg text-palette-1 leading-relaxed">
                  To transform Bicol into a dynamic cultural and economic powerhouse 
                  where art, creativity, and entrepreneurship intersect, driving
                  sustainable growth and innovation. By celebrating and nurturing the
                  region's rich heritage and creative talents, we envision a vibrant
                  community that contributes significantly to the global creative
                  economy while enhancing the local quality of life.
                </p>
                
                {/* Decorative corner accent */}
                <div className="absolute bottom-4 right-4 w-12 h-12 opacity-20">
                  <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-palette-2">
                    <path d="M0 0L100 100" stroke="currentColor" strokeWidth="6"/>
                    <path d="M100 0L0 100" stroke="currentColor" strokeWidth="6"/>
                  </svg>
                </div>
              </div>
            </motion.div>

            {/* Mission Card */}
            <motion.div
              className="flex-1 relative group"
              variants={itemVariants}
            >
              <div className="absolute inset-0 bg-gradient-to-tl from-palette-1/5 to-palette-1/20 rounded-2xl transform -rotate-1 group-hover:rotate-0 transition-transform duration-500"></div>
              <div className="relative z-10 p-8 lg:p-10 border border-palette-1/20 rounded-2xl backdrop-blur-sm bg-white/5 h-full">
                {/* Decorative icon */}
                <div className="w-16 h-16 mb-6 rounded-full bg-palette-1/10 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 text-palette-1">
                    <path fillRule="evenodd" d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 00-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 002.682 2.282 16.975 16.975 0 001.145.742zM12 13.5a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                  </svg>
                </div>
                
                <h3 className="font-bold text-3xl md:text-4xl text-palette-1 mb-4 flex items-center">
                  Our Mission
                  <div className="ml-3 h-px bg-palette-1/30 flex-grow"></div>
                </h3>
                
                <p className="text-lg text-palette-1 leading-relaxed">
                  To foster a thriving ecosystem for creativity and entrepreneurship
                  in Bicol, empowering artists and innovators by providing the
                  necessary resources and support to transform their ideas into
                  impactful products and businesses. Through the development of
                  creative hubs, we aim to stimulate both cultural and economic
                  growth, positioning Bicol as a key player in the global creative
                  economy.
                </p>
                
                {/* Decorative corner accent */}
                <div className="absolute bottom-4 right-4 w-12 h-12 opacity-20">
                  <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-palette-1">
                    <circle cx="50" cy="50" r="45" stroke="currentColor" strokeWidth="6"/>
                  </svg>
                </div>
              </div>
            </motion.div>
          </div>
          
          {/* Bottom callout */}
          <motion.div 
            className="mt-16 text-center"
            variants={itemVariants}
          >
            <span className="inline-block px-6 py-2 rounded-full bg-palette-2/10 text-palette-2 text-sm font-medium">
              Empowering Bicol's Creative Future
            </span>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};