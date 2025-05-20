const Container = ({ children, className }) => {
    return (
      <div className={`w-full md:w-[720px]  lg:w-[1300px] mx-auto mt-5 ${className}`}>
        {children}
      </div>
    );
  };
  
  export default Container;
