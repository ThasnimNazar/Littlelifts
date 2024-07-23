const Parenthero: React.FC = () => {
    return (
        <>
            <div
                className="hero"
                style={{
                    backgroundImage: "url(https://images.unsplash.com/photo-1513492806696-9da1b77bd380?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D)",
                    height: '500px', backgroundPosition: 'center', backgroundSize: "cover"
                }}>
                <div className="hero-overlay bg-opacity-50"></div>
                <div className="hero-content text-neutral-content text-center">
                    <div className="max-w-md">
                        <h1 className="mb-5 text-5xl text-white font-bold" style={{ fontFamily: "Agrandir, Helvetica, Arial, Lucida, sans-serif" }}>Flexible childcare for busy lives</h1>
                        <p className="mb-5 font-semibold text-white" style={{fontFamily:'sans-serif'}}>
                        Book and find brilliant sitters with our easy-to-use childcare app, loved by parents like you!!
                        </p>
                        <div className="relative">
                            <label htmlFor="Search" className="sr-only"> Search </label>

                            <input
                                type="text"
                                id="Search"
                                placeholder="Search for..."
                                className="w-full rounded-3xl border-gray-200 py-2.5 pe-10 shadow-sm sm:text-sm"
                            />

                            <span className="absolute inset-y-0 end-0 grid w-10 place-content-center">
                                <button type="button" className="text-gray-600 hover:text-gray-700">
                                    <span className="sr-only">Search</span>

                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        strokeWidth="1.5"
                                        stroke="currentColor"
                                        className="h-4 w-4"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                                        />
                                    </svg>
                                </button>
                            </span>
                        </div>
                        <br></br>
                        <button className="btn btn-neutral w-32">Neutral</button>
                    </div>

                </div>
            </div>
        </>
    )
}

export default Parenthero;

