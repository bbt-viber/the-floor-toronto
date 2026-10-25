// Watch Brands Game Pack - 45 Visual Trivia Prompts
const GAME_WATCH_BRANDS = {
  id: "watch-brands",
  title: "Watch Brands",
  description: "Identify the watch brand from its iconic timepiece silhouette, dial layout, bezel, or signature design — with no brand names shown!",
  category: "Luxury & Horology",
  difficulty: "Progressive (Tier 1 → Tier 4 Obscure)",
  cluesCount: 45,
  defaultTimer: 45,
  bannerColor: "linear-gradient(135deg, #0f2027 0%, #203a43 50%, #c9a227 100%)",
  clues: [
    // Tier 1: Easy / Universal Icons (1-13)
    {
      id: "clue_watch_rolex",
      answer: "Rolex",
      image: "watch-brands/Rolex.jpg",
      hint: "Iconic steel dive watch with fluted/rotating bezel, Mercedes hands, and Cyclops date magnifier"
    },
    {
      id: "clue_watch_casio",
      answer: "Casio",
      image: "watch-brands/Casio.jpg",
      hint: "Retro rectangular black resin digital LCD watch (F-91W style)"
    },
    {
      id: "clue_watch_timex",
      answer: "Timex",
      image: "watch-brands/Timex.jpg",
      hint: "Accessible American sports and field watch pioneer known for Ironman and Indiglo"
    },
    {
      id: "clue_watch_swatch",
      answer: "Swatch",
      image: "watch-brands/Swatch.jpg",
      hint: "Colorful Swiss plastic quartz watch with playful pop-art design"
    },
    {
      id: "clue_watch_g_shock",
      answer: "G-Shock",
      image: "watch-brands/G-Shock.jpg",
      hint: "Rugged octagonal shock-resistant tactical resin digital/ana-digi watch"
    },
    {
      id: "clue_watch_apple",
      answer: "Apple",
      image: "watch-brands/Apple.jpg",
      hint: "Rounded rectangular aluminum smartwatch with Digital Crown on the side"
    },
    {
      id: "clue_watch_seiko",
      answer: "Seiko",
      image: "watch-brands/Seiko.jpg",
      hint: "Classic Japanese automatic dive watch with offset crown at 4 o'clock"
    },
    {
      id: "clue_watch_citizen",
      answer: "Citizen",
      image: "watch-brands/Citizen.jpg",
      hint: "Japanese solar-powered Eco-Drive aviation and dive chronograph"
    },
    {
      id: "clue_watch_omega",
      answer: "Omega",
      image: "watch-brands/Omega.jpg",
      hint: "Legendary Speedmaster Moonwatch chronograph with black tachymeter bezel"
    },
    {
      id: "clue_watch_movado",
      answer: "Movado",
      image: "watch-brands/Movado.jpg",
      hint: "Minimalist black Museum dial with a single metallic concave dot at 12 o'clock"
    },
    {
      id: "clue_watch_fossil",
      answer: "Fossil",
      image: "watch-brands/Fossil.jpg",
      hint: "Vintage-inspired American fashion chronograph on a thick saddle leather strap"
    },
    {
      id: "clue_watch_tag_heuer",
      answer: "TAG Heuer",
      image: "watch-brands/TAG Heuer.jpg",
      hint: "Square-cased racing chronograph made famous by Steve McQueen in Le Mans"
    },
    {
      id: "clue_watch_garmin",
      answer: "Garmin",
      image: "watch-brands/Garmin.jpg",
      hint: "Rugged GPS multisport outdoor fitness watch with Exposed bezel screws"
    },

    // Tier 2: Medium / Mainstream Luxury & Enthusiast Classics (14-30)
    {
      id: "clue_watch_cartier",
      answer: "Cartier",
      image: "watch-brands/Cartier.jpg",
      hint: "Rectangular Tank dress watch with Roman numerals, chemin-de-fer track, and blue sapphire cabochon crown"
    },
    {
      id: "clue_watch_tissot",
      answer: "Tissot",
      image: "watch-brands/Tissot.jpg",
      hint: "Swiss 1853 watchmaker known for the integrated-bracelet PRX and Le Locle dress watches"
    },
    {
      id: "clue_watch_audemars_piguet",
      answer: "Audemars Piguet",
      image: "watch-brands/Audemars Piguet.jpg",
      hint: "Royal Oak luxury steel sports watch with octagonal bezel, 8 hexagonal screws, and Tapisserie dial"
    },
    {
      id: "clue_watch_patek_philippe",
      answer: "Patek Philippe",
      image: "watch-brands/Patek Philippe.jpg",
      hint: "Prestigious Geneva watchmaker of the porthole-shaped Nautilus with horizontal embossed dial"
    },
    {
      id: "clue_watch_breitling",
      answer: "Breitling",
      image: "watch-brands/Breitling.jpg",
      hint: "Navitimer aviation chronograph with intricate circular logarithmic slide-rule bezel"
    },
    {
      id: "clue_watch_tudor",
      answer: "Tudor",
      image: "watch-brands/Tudor.jpg",
      hint: "Black Bay dive watch featuring signature angular Snowflake hands"
    },
    {
      id: "clue_watch_hamilton",
      answer: "Hamilton",
      image: "watch-brands/Hamilton.jpg",
      hint: "Futuristic triangular shield-shaped Ventura watch worn by Elvis Presley and in Men in Black"
    },
    {
      id: "clue_watch_longines",
      answer: "Longines",
      image: "watch-brands/Longines.jpg",
      hint: "Historic Swiss winged-hourglass watchmaker known for Master Collection & aviation chronographs"
    },
    {
      id: "clue_watch_orient",
      answer: "Orient",
      image: "watch-brands/Orient.jpg",
      hint: "Japanese mechanical watchmaker famous for the domed-crystal Bambino and open-heart dials"
    },
    {
      id: "clue_watch_bulova",
      answer: "Bulova",
      image: "watch-brands/Bulova.jpg",
      hint: "Tuning-fork Accutron Spaceview with exposed green electronic circuit and coils"
    },
    {
      id: "clue_watch_panerai",
      answer: "Panerai",
      image: "watch-brands/Panerai.jpg",
      hint: "Oversized Italian cushion-case Luminor dive watch with trademark lever-locking crown guard bridge"
    },
    {
      id: "clue_watch_iwc",
      answer: "IWC",
      image: "watch-brands/IWC.jpg",
      hint: "Schaffhausen watchmaker famous for the Big Pilot watch with oversized conical onion crown"
    },
    {
      id: "clue_watch_hublot",
      answer: "Hublot",
      image: "watch-brands/Hublot.jpg",
      hint: "Big Bang sports chronograph with porthole bezel, H-shaped screws, and rubber strap"
    },
    {
      id: "clue_watch_shinola",
      answer: "Shinola",
      image: "watch-brands/Shinola.jpg",
      hint: "Detroit-assembled Runwell watch with bold vintage Arabic numerals and wire lugs"
    },
    {
      id: "clue_watch_invicta",
      answer: "Invicta",
      image: "watch-brands/Invicta.jpg",
      hint: "Bold gold-toned Pro Diver automatic watch with scalloped bezel"
    },
    {
      id: "clue_watch_rado",
      answer: "Rado",
      image: "watch-brands/Rado.jpg",
      hint: "Swiss 'Master of Materials' known for high-tech scratch-resistant ceramic and DiaStar watches"
    },
    {
      id: "clue_watch_oris",
      answer: "Oris",
      image: "watch-brands/Oris.jpg",
      hint: "Independent Swiss mechanical watchmaker known for the Big Crown Pointer Date and Aquis diver"
    },

    // Tier 3: Hard / Haute Horlogerie & Connoisseur Icons (31-41)
    {
      id: "clue_watch_jaeger_lecoultre",
      answer: "Jaeger-LeCoultre",
      image: "watch-brands/Jaeger-LeCoultre.jpg",
      hint: "Art Deco rectangular Reverso watch whose case slides and flips over to protect the crystal"
    },
    {
      id: "clue_watch_vacheron_constantin",
      answer: "Vacheron Constantin",
      image: "watch-brands/Vacheron Constantin.jpg",
      hint: "Oldest continuously operating watchmaker (1755), famous for Maltese cross motif and Overseas line"
    },
    {
      id: "clue_watch_piaget",
      answer: "Piaget",
      image: "watch-brands/Piaget.jpg",
      hint: "Swiss luxury maison famous for record-breaking ultra-thin Altiplano and Polo dress watches"
    },
    {
      id: "clue_watch_chopard",
      answer: "Chopard",
      image: "watch-brands/Chopard.jpg",
      hint: "Swiss luxury jeweler and watchmaker known for Happy Diamonds and Mille Miglia racing chronographs"
    },
    {
      id: "clue_watch_bell_ross",
      answer: "Bell & Ross",
      image: "watch-brands/Bell & Ross.jpg",
      hint: "Circle-in-a-square aircraft cockpit instrument watch with four exposed corner screws"
    },
    {
      id: "clue_watch_zenith",
      answer: "Zenith",
      image: "watch-brands/Zenith.jpg",
      hint: "High-frequency El Primero chronograph with signature overlapping tri-color sub-dials"
    },
    {
      id: "clue_watch_breguet",
      answer: "Breguet",
      image: "watch-brands/Breguet.jpg",
      hint: "Historic neoclassical watch with coin-edge case, hand-engraved guilloché dial, and open-tipped hands"
    },
    {
      id: "clue_watch_blancpain",
      answer: "Blancpain",
      image: "watch-brands/Blancpain.jpg",
      hint: "Maker of the 1953 Fifty Fathoms dive watch with domed sapphire bezel and diamond marker at 12"
    },
    {
      id: "clue_watch_nomos",
      answer: "Nomos",
      image: "watch-brands/Nomos.jpg",
      hint: "Glashütte Bauhaus minimalist Tangente watch with thin bezel, angular lugs, and typography numerals"
    },
    {
      id: "clue_watch_sinn",
      answer: "Sinn",
      image: "watch-brands/Sinn.jpg",
      hint: "German submarine-steel tool dive and pilot watches from Frankfurt"
    },
    {
      id: "clue_watch_grand_seiko",
      answer: "Grand Seiko",
      image: "watch-brands/Grand Seiko.jpg",
      hint: "Luxury Japanese watch with Zaratsu mirror-polished lugs, Spring Drive, and Snowflake textured dial"
    },

    // Tier 4: Obscure / Ultra-Luxury & Independent Grail Watchmakers (42-45)
    {
      id: "clue_watch_franck_muller",
      answer: "Franck Muller",
      image: "watch-brands/Franck Muller.jpg",
      hint: "Curved tonneau Cintrée Curvex watch famous for flamboyant exploding Art Deco numerals"
    },
    {
      id: "clue_watch_richard_mille",
      answer: "Richard Mille",
      image: "watch-brands/Richard Mille.jpg",
      hint: "Ultra-lightweight curved tonneau skeletonized racing watch with Titanium spline screws on the bezel"
    },
    {
      id: "clue_watch_a_lange_sohne",
      answer: "A. Lange & Söhne",
      image: "watch-brands/A. Lange & Söhne.jpg",
      hint: "Saxon haute horlogerie icon (Lange 1) with asymmetric non-overlapping dial and outsize double-window date"
    },
    {
      id: "clue_watch_jacob_co",
      answer: "Jacob & Co.",
      image: "watch-brands/Jacob & Co..jpg",
      hint: "Extravagant high-complication Astronomia watch under a panoramic sapphire dome"
    }
  ]
};

if (typeof window !== 'undefined') {
  window.GAME_WATCH_BRANDS = GAME_WATCH_BRANDS;
} else if (typeof global !== 'undefined') {
  global.GAME_WATCH_BRANDS = GAME_WATCH_BRANDS;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = GAME_WATCH_BRANDS;
}
