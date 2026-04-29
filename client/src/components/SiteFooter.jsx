export default function SiteFooter() {
  return (
    <footer style={{ fontFamily: "'Montserrat', sans-serif", position: 'relative', backgroundColor: '#FEE5F6' }}>

      {/* SVG background image sets the natural height — content sits on top of it */}
      <div style={{ position: 'relative' }}>
        <img
          src="https://transformhealthcoalition.org/wp-content/themes/th/assets/images/footer_icon_bg.svg"
          alt=""
          style={{ display: 'block', width: '100%', padding: '25px 5vw', boxSizing: 'border-box' }}
        />

        {/* Content absolutely centred over the SVG — matches parent site's top:45% left:55% */}
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '55%',
          transform: 'translate(-50%, -50%)',
          maxWidth: '70%',
          width: '100%',
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[
              'Policies',
              'Media Enquiries',
              'Get Involved',
              'Opportunities',
              'Equity & Inclusion Dashboard',
              'Privacy Policy',
            ].map((link) => (
              <a key={link} href="#" style={{ color: '#fff', textDecoration: 'none', fontSize: 14 }}>
                {link}
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Copyright bar */}
      <div style={{
        background: '#002D48',
        color: '#fff',
        fontSize: 14,
        fontWeight: 300,
        padding: '10px 0',
        textAlign: 'center',
      }}>
        Copyright © {new Date().getFullYear()} Transform Health. All Rights Reserved.
      </div>

    </footer>
  )
}
