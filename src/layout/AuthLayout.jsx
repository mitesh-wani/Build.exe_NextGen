const AuthLayout = ({ children }) => {
    return (
      <div style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "#f1f5f9"
      }}>
        <div style={{
          width: "380px",
          background: "white",
          padding: "30px",
          borderRadius: "8px"
        }}>
          {children}
        </div>
      </div>
    );
  };
  
  export default AuthLayout;
  