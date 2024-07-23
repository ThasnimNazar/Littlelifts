import './Css/Admin/Body.css';



const Hero = () => {
  return (
    <div className="relative flex flex-col items-center mx-auto lg:flex-row-reverse lg:max-w-5xl lg:mt-12 xl:max-w-6xl">
      {/* Image Column */}
      <div className="w-full h-64 lg:w-1/2 lg:h-auto">
        <img className="h-full w-full object-cover" src="https://images.unsplash.com/photo-1713942590283-59867d5e3f8d?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" alt="Winding mountain road" />
      </div>
      {/* Close Image Column */}

      {/* Text Column */}
      <div className="mr-10 max-w-lg bg-white md:max-w-2xl md:z-10 md:shadow-lg md:absolute md:top-0 md:mt-48 lg:w-3/5 lg:left-0 lg:mt-20 lg:ml-20 xl:mt-24 xl:ml-12">
        {/* Text Wrapper */}
        <div className="flex flex-col p-12 md:px-16">
          <h2 className="text-2xl font-medium uppercase text-sky-800 lg:text-4xl">Trusted and reliable babycare</h2>
          <p className="mt-4">
          Explore how Littlelifts can make finding childcare easier than ever. Sign up and get started today!
          </p>
          {/* Button Container */}
          <div className="mt-8">
            <a
              href="#"
              className="inline-block w-full text-center text-lg font-medium text-gray-100 bg-sky-800 border-solid border-2 border-gray-600 py-4 px-10 hover:bg-green-800 hover:shadow-md md:w-48"
            >4
              Read More
            </a>
          </div>
        </div>
        {/* Close Text Wrapper */}
      </div>
      {/* Close Text Column */}
    </div>
    // Close Container
  );
};



export default Hero;
