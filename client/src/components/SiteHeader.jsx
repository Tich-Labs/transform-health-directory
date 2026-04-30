export default function SiteHeader() {
  return (
    <header
      style={{
        background: "#fffff4",
        padding: "15px 25px",
        width: "100%",
        position: "sticky",
        top: 0,
        zIndex: 999,
        fontFamily: "'Montserrat', sans-serif",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          maxWidth: "1400px",
          margin: "0 auto",
        }}
      >
        <div className="logo">
          <img
            src="https://transformhealthcoalition.org/wp-content/themes/th/assets/images/main_logo.svg"
            alt="Transform Health"
            style={{ height: 40, display: "block" }}
          />
        </div>
        <nav>
          <ul
            style={{
              display: "flex",
              listStyle: "none",
              margin: 0,
              padding: 0,
              gap: 0,
            }}
          >
            {[
              "Home",
              "About",
              "Our Work",
              "Partners",
              "Insights",
              "National Coalitions",
            ].map((item) => (
              <li key={item}>
                <a
                  href="#"
                  style={{
                    fontSize: 16,
                    textTransform: "uppercase",
                    padding: "0 15px",
                    color: "#333",
                    textDecoration: "none",
                    fontFamily: "'Montserrat', sans-serif",
                    fontWeight: 500,
                    letterSpacing: "0.03em",
                  }}
                >
                  {item}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}
