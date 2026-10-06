/* ============================================================================
   MOLLWEIDE ALLIANCE — CONTENT CONFIG
   ----------------------------------------------------------------------------
   Everything the site displays comes from this one file. You never need to
   touch HTML or CSS to change copy, members, hubs or routes.

   Items marked  // TODO  are guesses you should confirm.
   ========================================================================== */

const ALLIANCE = {
  name:      'Mollweide Alliance',
  shortName: 'Mollweide',
  code:      'MWA',
  tagline:   'Further together. A wider world.',
  tagline2:  'More places. A brighter tomorrow.',
  founded:   2024,                        // TODO confirm founding year
  hq:        'Geneva, Switzerland',       // TODO confirm
  game:      'The Airline Simulator',
  discord:   null,                        // add a URL to show the Discord link

  // Where member airlines send material for the site. Shown on submit.html.
  submitTo:  'the alliance Discord',      // TODO replace with the real channel or address

  statement:
    'Mollweide Alliance brings independently operated carriers together under ' +
    'one standard of service, one loyalty programme and one coordinated ' +
    'network. Named for the equal-area projection that shows every part of the ' +
    'world at its true size, the alliance was founded on a simple principle: ' +
    'no region is a footnote.'
};

/* ============================================================================
   MEMBER AIRLINES
   `tail` is the livery photograph used on member cards.
   `color` tints that airline throughout the UI (result rows, chips, seat maps).
   ========================================================================== */

const MEMBERS = [
  {
    name:'Lemanair', code:'LX', country:'Switzerland', 
    color:'#1B4A8F', tail:'assets/img/members/lemanair.webp',
    hubs:['GVA'], focus:[], joined:2024,
    blurb:'The alliance\'s Alpine gateway. From Geneva, Lemanair links western ' +
          'Switzerland to the network with a precision short-haul operation and ' +
          'a growing long-haul programme.'
  },
  {
    name:'Caucausair', code:'CS', country:'Georgia', 
    color:'#2F7D57', tail:'assets/img/members/caucausair.webp',
    hubs:['TBS','GYD','EVN'], focus:['BUS'], joined:2024,
    blurb:'A genuinely tri-national carrier, operating coordinated hubs in ' +
          'Tbilisi, Baku and Yerevan, with Batumi as a summer focus city — the ' +
          'alliance\'s bridge between Europe and Central Asia.'
  },
  {
    name:'Dumont Linhas Aéreas', short:'Dumont', code:'DU', country:'Brazil', 
    color:'#1B3A63', tail:'assets/img/members/dumont.webp',
    hubs:['GIG','GRU'], focus:[], joined:2024,
    blurb:'Named for the aviation pioneer, Dumont flies the alliance\'s ' +
          'long-haul South Atlantic network from twin hubs at Rio de ' +
          'Janeiro–Galeão and São Paulo–Guarulhos.'
  },
  {
    name:'Rogato Linhas Aéreas', short:'Rogato', code:'RG', country:'Brazil', 
    color:'#C0342F', tail:'assets/img/members/rogato.webp',
    hubs:['CGH','BSB','SSA','BEL','GIG'], focus:[], joined:2025,
    blurb:'Brazil\'s domestic backbone within the alliance. Hubs at Congonhas, ' +
          'Brasília, Salvador, Belém and Galeão put almost every Brazilian city ' +
          'within one connection of the network.'
  },
  {
    name:'Aranya Air', code:'AY', country:'India',
    color:'#6B9A35', tail:'assets/img/members/aranya-air.webp',
    hubs:['BOM','DEL','BLR','HYD','MAA'], focus:[], joined:2026,
    blurb:'A five-hub South Asian network spanning Mumbai, Delhi, Bangalore, ' +
          'Hyderabad and Chennai, connecting the alliance with the growing ' +
          'Indian market and beyond.'
  },
  {
    name:'Aranya Rukmanidoot', code:'RK', country:'India',
    color:'#4E7A2A', tail:'assets/img/members/aranya-rukmanidoot.webp',
    hubs:['BOM','DEL','BLR','CCU'], focus:[], joined:2026,
    blurb:'Operating from Mumbai, Delhi, Bangalore and Kolkata, Aranya ' +
          'Rukmanidoot reinforces the alliance presence in the Indian domestic ' +
          'market. Its flowering livery is among the most recognisable in the network.'
  },
  {
    name:'Avni Airlines', code:'AV', country:'India',
    color:'#19A7DE', tail:'assets/img/members/avni.webp',
    hubs:['DEL','BOM','BLR','MAA','HYD','CCU','AMD','PNQ','TRV','CCJ',
          'GAU','LKO','JAI','ATQ','CMB','DPS','MRU'], focus:[], joined:2026,
    blurb:'The alliance\'s broadest Indian network, built on seventeen bases ' +
          'from Amritsar to Thiruvananthapuram, with international points at ' +
          'Colombo, Denpasar and Mauritius.'
  },
  {
    name:'AirLiban', code:'AL', country:'Lebanon', 
    color:'#C62B33', tail:'assets/img/members/airliban.webp',
    hubs:['BEY','CAI'], focus:[], joined:2025,
    blurb:'Operating twin Levantine hubs at Beirut and Cairo, AirLiban connects ' +
          'the eastern Mediterranean and North Africa into the wider alliance ' +
          'network.'
  },
  {
    name:'Mexicana', code:'MX', country:'Mexico', 
    color:'#2A2F38', tail:'assets/img/members/mexicana.webp',
    hubs:['MEX'], focus:[], joined:2025,
    blurb:'From Mexico City, Mexicana carries the alliance across Latin ' +
          'America and into the southern United States, feeding transpacific ' +
          'services through its Pacific-coast network.'
  },
  {
    name:'Californio Air', code:'CA', country:'United States', 
    color:'#1273D4', tail:'assets/img/members/californio.webp',
    hubs:['LAX'], focus:['SFO'], joined:2026,   // TODO confirm Californio's hub
    blurb:'A West Coast carrier bearing the bear and star, Californio provides ' +
          'the alliance\'s primary transpacific and North American gateway.'
  },
  {
    name:'Californio Shuttle', code:'CL', country:'United States',
    color:'#0A3D91', tail:'assets/img/members/californio-shuttle.webp',
    hubs:['LAX','SFO'], focus:[], joined:2026,
    blurb:'Californio Air\'s short-haul sister, shuttling between Los Angeles ' +
          'and San Francisco and feeding both gateways from across the West Coast.'
  },
  {
    name:'Volare', code:'VO', country:'Italy',
    color:'#1E7A3E', tail:'assets/img/members/volare.webp',
    hubs:['LIN','MXP','FCO','PMO','NAP'], focus:[], joined:2026,
    blurb:'The alliance\'s Italian member, operating from both Milan airports, ' +
          'Rome Fiumicino, Palermo and Naples.'
  },
  {
    name:'PolAir', code:'PL', country:'Poland',
    color:'#C9240C', tail:'assets/img/members/polair.webp',
    hubs:['WAW','KRK','SZY'], focus:[], joined:2026,
    blurb:'The alliance\'s Polish member, linking Central Europe to the wider ' +
          'network through Warsaw Chopin, with bases at Krakow and ' +
          'Olsztyn-Mazury serving the south and the north-east.'
  },
  {
    name:'StrayaJet', code:'SJ', country:'Australia',
    color:'#AE1457', tail:'assets/img/members/strayajet.webp',
    hubs:['BNE','WLG','NOU','POM','MNL','CGK','HLP','KUL','HND','MLE',
          'HYD','MCT','RUH','SCL','GRU','JNB','SEZ','TNR'], focus:[], joined:2026,
    blurb:'An eighteen-base operation spanning the Pacific, Southeast Asia and ' +
          'the Indian Ocean, reaching as far as Santiago, São Paulo and ' +
          'Johannesburg from its Brisbane base.'
  },
  {
    name:'MaraJet', code:'MJ', country:'Kenya',
    color:'#1550A0', tail:'assets/img/members/marajet.webp',
    hubs:['NBO','DSS'], focus:[], joined:2026,
    blurb:'The alliance\'s African member, linking East and West Africa through ' +
          'twin hubs at Nairobi and Dakar.'
  },
  {
    name:'Aloha Air', code:'AO', country:'United States', 
    color:'#2E5F9E', tail:'assets/img/members/aloha-air.webp',
    hubs:['OGG'], focus:[], joined:2026,
    blurb:'Based at Kahului on Maui, Aloha Air operates the alliance\'s ' +
          'mid-Pacific services, wearing the Mollweide globe on its fin.'
  },
  {
    name:'Aloha Regional', code:'AR', country:'United States', 
    color:'#3E79A8', tail:'assets/img/members/aloha-regional.webp',
    hubs:['HNL'], focus:[], joined:2026,
    blurb:'The inter-island specialist. From Honolulu, Aloha Regional feeds the ' +
          'alliance\'s Pacific network with high-frequency turboprop services.'
  }
];

/* ============================================================================
   AIRPORTS — lat/lon drive the Mollweide network map, so keep them right.
   `hub: true` marks an alliance hub; `focus: true` a focus city.
   ========================================================================== */

const AIRPORTS = [
  /* --- Member hubs ------------------------------------------------------- */
  { code:'GVA', city:'Geneva',        name:'Genève Aéroport',          country:'Switzerland',  lat:46.24, lon:  6.11, hub:true },
  { code:'TBS', city:'Tbilisi',       name:'Shota Rustaveli Intl',     country:'Georgia',      lat:41.67, lon: 44.95, hub:true },
  { code:'GYD', city:'Baku',          name:'Heydar Aliyev Intl',       country:'Azerbaijan',   lat:40.47, lon: 50.05, hub:true },
  { code:'EVN', city:'Yerevan',       name:'Zvartnots Intl',           country:'Armenia',      lat:40.15, lon: 44.40, hub:true },
  { code:'BUS', city:'Batumi',        name:'Batumi Intl',              country:'Georgia',      lat:41.61, lon: 41.60, focus:true },
  { code:'GIG', city:'Rio de Janeiro',name:'Galeão',                   country:'Brazil',       lat:-22.81,lon:-43.25, hub:true },
  { code:'GRU', city:'São Paulo',     name:'Guarulhos',                country:'Brazil',       lat:-23.43,lon:-46.47, hub:true },
  { code:'CGH', city:'São Paulo',     name:'Congonhas',                country:'Brazil',       lat:-23.63,lon:-46.66, hub:true },
  { code:'BSB', city:'Brasília',      name:'Juscelino Kubitschek',     country:'Brazil',       lat:-15.87,lon:-47.92, hub:true },
  { code:'SSA', city:'Salvador',      name:'Deputado Luís E. Magalhães',country:'Brazil',      lat:-12.91,lon:-38.32, hub:true },
  { code:'BEL', city:'Belém',         name:'Val de Cães',              country:'Brazil',       lat: -1.38,lon:-48.48, hub:true },
  { code:'BOM', city:'Mumbai',        name:'Chhatrapati Shivaji',      country:'India',        lat:19.09, lon: 72.87, hub:true },
  { code:'DEL', city:'Delhi',         name:'Indira Gandhi Intl',       country:'India',        lat:28.56, lon: 77.10, hub:true },
  { code:'BLR', city:'Bangalore',     name:'Kempegowda Intl',          country:'India',        lat:13.20, lon: 77.71, hub:true },
  { code:'CCU', city:'Kolkata',       name:'Netaji Subhas Chandra Bose',country:'India',       lat:22.65, lon: 88.45, hub:true },
  { code:'BEY', city:'Beirut',        name:'Rafic Hariri Intl',        country:'Lebanon',      lat:33.82, lon: 35.49, hub:true },
  { code:'CAI', city:'Cairo',         name:'Cairo Intl',               country:'Egypt',        lat:30.11, lon: 31.41, hub:true },
  { code:'MEX', city:'Mexico City',   name:'Benito Juárez Intl',       country:'Mexico',       lat:19.44, lon:-99.07, hub:true },
  { code:'PVG', city:'Shanghai',      name:'Pudong Intl',              country:'China',        lat:31.14, lon:121.81 },
  { code:'CKG', city:'Chongqing',     name:'Jiangbei Intl',            country:'China',        lat:29.72, lon:106.64 },
  { code:'LAX', city:'Los Angeles',   name:'Los Angeles Intl',         country:'United States',lat:33.94, lon:-118.41,hub:true },
  { code:'SFO', city:'San Francisco', name:'San Francisco Intl',       country:'United States',lat:37.62, lon:-122.38,hub:true },
  { code:'OGG', city:'Kahului',       name:'Kahului Airport',          country:'United States',lat:20.90, lon:-156.43,hub:true },
  { code:'HNL', city:'Honolulu',      name:'Daniel K. Inouye Intl',    country:'United States',lat:21.32, lon:-157.92,hub:true },

  /* --- Network destinations ---------------------------------------------- */
  { code:'ZRH', city:'Zurich',        name:'Zurich Airport',           country:'Switzerland',  lat:47.46, lon:  8.55 },
  { code:'LHR', city:'London',        name:'Heathrow',                 country:'United Kingdom',lat:51.47,lon: -0.45 },
  { code:'CDG', city:'Paris',         name:'Charles de Gaulle',        country:'France',       lat:49.01, lon:  2.55 },
  { code:'FRA', city:'Frankfurt',     name:'Frankfurt am Main',        country:'Germany',      lat:50.04, lon:  8.56 },
  { code:'AMS', city:'Amsterdam',     name:'Schiphol',                 country:'Netherlands',  lat:52.31, lon:  4.76 },
  { code:'MAD', city:'Madrid',        name:'Barajas',                  country:'Spain',        lat:40.47, lon: -3.56 },
  { code:'BCN', city:'Barcelona',     name:'El Prat',                  country:'Spain',        lat:41.30, lon:  2.08 },
  { code:'LIS', city:'Lisbon',        name:'Humberto Delgado',         country:'Portugal',     lat:38.77, lon: -9.13 },
  { code:'FCO', city:'Rome',          name:'Fiumicino',                country:'Italy',        lat:41.80, lon: 12.25, hub:true },
  { code:'LIN', city:'Milan',         name:'Linate',                   country:'Italy',        lat:45.45, lon:  9.28, hub:true },
  { code:'NAP', city:'Naples',        name:'Capodichino',              country:'Italy',        lat:40.89, lon: 14.29, hub:true },
  { code:'PMO', city:'Palermo',       name:'Falcone Borsellino',       country:'Italy',        lat:38.18, lon: 13.10, hub:true },
  { code:'BNE', city:'Brisbane',      name:'Brisbane Airport',         country:'Australia',    lat:-27.38,lon:153.12, hub:true },
  { code:'WLG', city:'Wellington',    name:'Wellington Intl',          country:'New Zealand',  lat:-41.33,lon:174.81, hub:true },
  { code:'NOU', city:'Nouméa',        name:'La Tontouta Intl',         country:'New Caledonia',lat:-22.01,lon:166.21, hub:true },
  { code:'POM', city:'Port Moresby',  name:'Jacksons Intl',            country:'Papua New Guinea',lat:-9.44,lon:147.22, hub:true },
  { code:'HLP', city:'Jakarta',       name:'Halim Perdanakusuma',      country:'Indonesia',    lat:-6.27, lon:106.89, hub:true },
  { code:'HND', city:'Tokyo',         name:'Haneda',                   country:'Japan',        lat:35.55, lon:139.78, hub:true },
  { code:'MLE', city:'Malé',          name:'Velana Intl',              country:'Maldives',     lat: 4.19, lon: 73.53, hub:true },
  { code:'MCT', city:'Muscat',        name:'Muscat Intl',              country:'Oman',         lat:23.59, lon: 58.28, hub:true },
  { code:'SEZ', city:'Mahé',          name:'Seychelles Intl',          country:'Seychelles',   lat:-4.67, lon: 55.52, hub:true },
  { code:'TNR', city:'Antananarivo',  name:'Ivato Intl',               country:'Madagascar',   lat:-18.80,lon: 47.48, hub:true },
  { code:'MXP', city:'Milan',         name:'Malpensa',                 country:'Italy',        lat:45.63, lon:  8.72, hub:true },
  { code:'VIE', city:'Vienna',        name:'Vienna Intl',              country:'Austria',      lat:48.11, lon: 16.57 },
  { code:'MUC', city:'Munich',        name:'Franz Josef Strauss',      country:'Germany',      lat:48.35, lon: 11.79 },
  { code:'ATH', city:'Athens',        name:'Eleftherios Venizelos',    country:'Greece',       lat:37.94, lon: 23.94 },
  { code:'IST', city:'Istanbul',      name:'Istanbul Airport',         country:'Türkiye',      lat:41.26, lon: 28.74 },
  { code:'KBP', city:'Kyiv',          name:'Boryspil',                 country:'Ukraine',      lat:50.34, lon: 30.89 },
  { code:'WAW', city:'Warsaw',        name:'Chopin',                   country:'Poland',       lat:52.17, lon: 20.97, hub:true },
  { code:'KRK', city:'Krakow',        name:'John Paul II',             country:'Poland',       lat:50.08, lon: 19.80, hub:true },
  { code:'SZY', city:'Olsztyn',       name:'Olsztyn-Mazury',           country:'Poland',       lat:53.48, lon: 20.94, hub:true },
  { code:'CPH', city:'Copenhagen',    name:'Kastrup',                  country:'Denmark',      lat:55.62, lon: 12.66 },
  { code:'ARN', city:'Stockholm',     name:'Arlanda',                  country:'Sweden',       lat:59.65, lon: 17.92 },
  { code:'OSL', city:'Oslo',          name:'Gardermoen',               country:'Norway',       lat:60.19, lon: 11.10 },
  { code:'DUB', city:'Dublin',        name:'Dublin Airport',           country:'Ireland',      lat:53.42, lon: -6.27 },
  { code:'ALA', city:'Almaty',        name:'Almaty Intl',              country:'Kazakhstan',   lat:43.35, lon: 77.04 },
  { code:'TAS', city:'Tashkent',      name:'Islam Karimov Intl',       country:'Uzbekistan',   lat:41.26, lon: 69.28 },
  { code:'SKD', city:'Samarkand',     name:'Samarkand Intl',           country:'Uzbekistan',   lat:39.70, lon: 66.98 },
  { code:'DXB', city:'Dubai',         name:'Dubai Intl',               country:'UAE',          lat:25.25, lon: 55.36 },
  { code:'DOH', city:'Doha',          name:'Hamad Intl',               country:'Qatar',        lat:25.27, lon: 51.61 },
  { code:'RUH', city:'Riyadh',        name:'King Khalid Intl',         country:'Saudi Arabia', lat:24.96, lon: 46.70, hub:true },
  { code:'AMM', city:'Amman',         name:'Queen Alia Intl',          country:'Jordan',       lat:31.72, lon: 35.99 },
  { code:'TLV', city:'Tel Aviv',      name:'Ben Gurion',               country:'Israel',       lat:32.01, lon: 34.89 },
  { code:'JNB', city:'Johannesburg',  name:'O. R. Tambo',              country:'South Africa', lat:-26.13,lon: 28.24, hub:true },
  { code:'NBO', city:'Nairobi',       name:'Jomo Kenyatta',            country:'Kenya',        lat: -1.32,lon: 36.93, hub:true },
  { code:'DSS', city:'Dakar',         name:'Blaise Diagne Intl',       country:'Senegal',      lat:14.67, lon:-17.07, hub:true },
  { code:'LOS', city:'Lagos',         name:'Murtala Muhammed',         country:'Nigeria',      lat:  6.58,lon:  3.32 },
  { code:'CMN', city:'Casablanca',    name:'Mohammed V',               country:'Morocco',      lat:33.37, lon: -7.59 },
  { code:'ADD', city:'Addis Ababa',   name:'Bole Intl',                country:'Ethiopia',     lat: 8.98, lon: 38.80 },
  { code:'MAA', city:'Chennai',       name:'Chennai Intl',             country:'India',        lat:12.99, lon: 80.17, hub:true },
  { code:'HYD', city:'Hyderabad',     name:'Rajiv Gandhi Intl',        country:'India',        lat:17.24, lon: 78.43, hub:true },
  { code:'CMB', city:'Colombo',       name:'Bandaranaike Intl',        country:'Sri Lanka',    lat: 7.18, lon: 79.88, hub:true },
  { code:'TRV', city:'Thiruvananthapuram', name:'Trivandrum Intl',     country:'India',        lat: 8.48, lon: 76.92, hub:true },
  { code:'CCJ', city:'Kozhikode',     name:'Calicut Intl',             country:'India',        lat:11.14, lon: 75.96, hub:true },
  { code:'PNQ', city:'Pune',          name:'Pune Airport',             country:'India',        lat:18.58, lon: 73.92, hub:true },
  { code:'AMD', city:'Ahmedabad',     name:'Sardar Vallabhbhai Patel', country:'India',        lat:23.07, lon: 72.63, hub:true },
  { code:'GAU', city:'Guwahati',      name:'Lokpriya Gopinath Bordoloi',country:'India',       lat:26.11, lon: 91.59, hub:true },
  { code:'LKO', city:'Lucknow',       name:'Chaudhary Charan Singh',   country:'India',        lat:26.76, lon: 80.89, hub:true },
  { code:'JAI', city:'Jaipur',        name:'Jaipur Intl',              country:'India',        lat:26.82, lon: 75.80, hub:true },
  { code:'ATQ', city:'Amritsar',      name:'Sri Guru Ram Dass Jee',    country:'India',        lat:31.71, lon: 74.80, hub:true },
  { code:'DPS', city:'Denpasar',      name:'Ngurah Rai Intl',          country:'Indonesia',    lat:-8.75, lon:115.17, hub:true },
  { code:'MRU', city:'Mauritius',     name:'Sir Seewoosagur Ramgoolam',country:'Mauritius',    lat:-20.43,lon: 57.68, hub:true },
  { code:'KTM', city:'Kathmandu',     name:'Tribhuvan Intl',           country:'Nepal',        lat:27.70, lon: 85.36 },
  { code:'DAC', city:'Dhaka',         name:'Hazrat Shahjalal',         country:'Bangladesh',   lat:23.84, lon: 90.40 },
  { code:'BKK', city:'Bangkok',       name:'Suvarnabhumi',             country:'Thailand',     lat:13.69, lon:100.75 },
  { code:'SIN', city:'Singapore',     name:'Changi',                   country:'Singapore',    lat: 1.36, lon:103.99 },
  { code:'KUL', city:'Kuala Lumpur',  name:'KLIA',                     country:'Malaysia',     lat: 2.75, lon:101.71, hub:true },
  { code:'HKG', city:'Hong Kong',     name:'Hong Kong Intl',           country:'Hong Kong',    lat:22.31, lon:113.91 },
  { code:'PEK', city:'Beijing',       name:'Capital Intl',             country:'China',        lat:40.08, lon:116.58 },
  { code:'CAN', city:'Guangzhou',     name:'Baiyun Intl',              country:'China',        lat:23.39, lon:113.31 },
  { code:'CTU', city:'Chengdu',       name:'Tianfu Intl',              country:'China',        lat:30.31, lon:104.44 },
  { code:'NRT', city:'Tokyo',         name:'Narita Intl',              country:'Japan',        lat:35.77, lon:140.39 },
  { code:'KIX', city:'Osaka',         name:'Kansai Intl',              country:'Japan',        lat:34.43, lon:135.24 },
  { code:'ICN', city:'Seoul',         name:'Incheon Intl',             country:'South Korea',  lat:37.46, lon:126.44 },
  { code:'TPE', city:'Taipei',        name:'Taoyuan Intl',             country:'Taiwan',       lat:25.08, lon:121.23 },
  { code:'MNL', city:'Manila',        name:'Ninoy Aquino Intl',        country:'Philippines',  lat:14.51, lon:121.02, hub:true },
  { code:'CGK', city:'Jakarta',       name:'Soekarno–Hatta',           country:'Indonesia',    lat:-6.13, lon:106.66, hub:true },
  { code:'SYD', city:'Sydney',        name:'Kingsford Smith',          country:'Australia',    lat:-33.94,lon:151.18 },
  { code:'MEL', city:'Melbourne',     name:'Tullamarine',              country:'Australia',    lat:-37.67,lon:144.84 },
  { code:'AKL', city:'Auckland',      name:'Auckland Intl',            country:'New Zealand',  lat:-37.01,lon:174.79 },
  { code:'NAN', city:'Nadi',          name:'Nadi Intl',                country:'Fiji',         lat:-17.76,lon:177.44 },
  { code:'PPT', city:'Papeete',       name:'Faa\'a Intl',              country:'French Polynesia',lat:-17.56,lon:-149.61 },
  { code:'GUM', city:'Guam',          name:'A.B. Won Pat Intl',        country:'Guam',         lat:13.48, lon:144.80 },
  { code:'JFK', city:'New York',      name:'John F. Kennedy',          country:'United States',lat:40.64, lon:-73.78 },
  { code:'ORD', city:'Chicago',       name:'O\'Hare',                  country:'United States',lat:41.98, lon:-87.90 },
  { code:'SEA', city:'Seattle',       name:'Seattle–Tacoma',           country:'United States',lat:47.45, lon:-122.31},
  { code:'DFW', city:'Dallas',        name:'Dallas/Fort Worth',        country:'United States',lat:32.90, lon:-97.04 },
  { code:'MIA', city:'Miami',         name:'Miami Intl',               country:'United States',lat:25.80, lon:-80.29 },
  { code:'YYZ', city:'Toronto',       name:'Pearson',                  country:'Canada',       lat:43.68, lon:-79.63 },
  { code:'YVR', city:'Vancouver',     name:'Vancouver Intl',           country:'Canada',       lat:49.19, lon:-123.18},
  { code:'CUN', city:'Cancún',        name:'Cancún Intl',              country:'Mexico',       lat:21.04, lon:-86.87 },
  { code:'GDL', city:'Guadalajara',   name:'Miguel Hidalgo',           country:'Mexico',       lat:20.52, lon:-103.31},
  { code:'BOG', city:'Bogotá',        name:'El Dorado',                country:'Colombia',     lat: 4.70, lon:-74.15 },
  { code:'LIM', city:'Lima',          name:'Jorge Chávez',             country:'Peru',         lat:-12.02,lon:-77.11 },
  { code:'SCL', city:'Santiago',      name:'Arturo Merino Benítez',    country:'Chile',        lat:-33.39,lon:-70.79, hub:true },
  { code:'EZE', city:'Buenos Aires',  name:'Ezeiza',                   country:'Argentina',    lat:-34.82,lon:-58.54 },
  { code:'MVD', city:'Montevideo',    name:'Carrasco',                 country:'Uruguay',      lat:-34.84,lon:-56.03 },
  { code:'REC', city:'Recife',        name:'Guararapes',               country:'Brazil',       lat:-8.13, lon:-34.92 },
  { code:'FOR', city:'Fortaleza',     name:'Pinto Martins',            country:'Brazil',       lat:-3.78, lon:-38.53 },
  { code:'MAO', city:'Manaus',        name:'Eduardo Gomes',            country:'Brazil',       lat:-3.04, lon:-60.05 },
  { code:'POA', city:'Porto Alegre',  name:'Salgado Filho',            country:'Brazil',       lat:-29.99,lon:-51.17 },
  { code:'CNF', city:'Belo Horizonte',name:'Confins',                  country:'Brazil',       lat:-19.62,lon:-43.97 }
];

/* ============================================================================
   CABINS — price multipliers and seat-map geometry.
   ========================================================================== */

const CABINS = [
  { id:'first',    name:'First',           abbr:'F', mult:6.20, rows:[1,2],   layout:[1,1,1],
    perks:['3 × 32 kg checked baggage','Private suite','Chauffeur transfer','Dedicated check-in'] },
  { id:'business', name:'Business',        abbr:'J', mult:3.40, rows:[3,9],   layout:[1,2,1],
    perks:['2 × 32 kg checked baggage','Alliance lounge access','Fully flat bed','Priority boarding'] },
  { id:'premium',  name:'Premium Economy', abbr:'W', mult:1.85, rows:[10,15], layout:[2,3,2],
    perks:['2 × 23 kg checked baggage','Priority boarding','38-inch seat pitch'] },
  { id:'economy',  name:'Economy',         abbr:'Y', mult:1.00, rows:[16,38], layout:[3,3],
    perks:['23 kg checked baggage','Complimentary meal service','Seat selection from check-in'] }
];

/* ============================================================================
   FLEET — equipment is assigned by sector length.
   ========================================================================== */

const AIRCRAFT = [
  { type:'ATR 72-600',        code:'AT76', maxKm: 1500, wide:false },
  { type:'Embraer E195-E2',   code:'E295', maxKm: 4800, wide:false },
  { type:'Airbus A220-300',   code:'A223', maxKm: 6300, wide:false },
  { type:'Airbus A320neo',    code:'A20N', maxKm: 6500, wide:false },
  { type:'Boeing 737 MAX 8',  code:'B38M', maxKm: 6600, wide:false },
  { type:'Airbus A321XLR',    code:'A21X', maxKm: 8700, wide:false },
  { type:'Boeing 787-9',      code:'B789', maxKm:14100, wide:true  },
  { type:'Airbus A350-900',   code:'A359', maxKm:15000, wide:true  },
  { type:'Boeing 777-300ER',  code:'B77W', maxKm:13600, wide:true  },
  { type:'Airbus A350-1000',  code:'A35K', maxKm:16100, wide:true  }
];

/* ============================================================================
   LOYALTY — Elara
   ========================================================================== */

const PROGRAMME = 'Elara';
const TIERS = [
  { name:'Member', need:0,      color:'#8FA6C4',
    perks:['Mileage accrual across all seventeen carriers','Online check-in','Member fares'] },
  { name:'Select', need:25000,  color:'#4E9BD4',
    perks:['Priority check-in','One additional checked bag','Preferred seating'] },
  { name:'Strata', need:60000,  color:'#1B4A8F',
    perks:['Alliance lounge access worldwide','Priority boarding and baggage delivery','Upgrade certificates'] },
  { name:'Aurora', need:120000, color:'#13398C',
    perks:['First-class lounge access','Guaranteed last-seat availability','Dedicated service line','Chauffeur transfer'] }
];

/* ============================================================================
   NEWSROOM — press releases
   ----------------------------------------------------------------------------
   `body` and `after` are arrays of paragraphs. `quote.paras` renders as a
   pull quote attributed to `quote.who` / `quote.role`.
   ========================================================================== */

const PRESS = [
  {
    date:'2026-09-27', dateline:'Rio de Janeiro', tag:'Membership',
    title:'Mollweide welcomes Aranya Rukmanidoot, Rogato Linhas Aéreas, Mexicana and AirLiban to the alliance',
    standfirst:'Mollweide today announced that Aranya Rukmanidoot, Rogato Linhas Aéreas, ' +
               'Mexicana and AirLiban have joined the alliance.',
    body:[
      'The announcement marks the largest single intake of new members since Mollweide was ' +
      'founded, adding new destinations and connections across India, Brazil, Mexico and Lebanon.',
      'Aranya Rukmanidoot reinforces the alliance presence in South Asia, particularly in the ' +
      'Indian domestic market with hubs in Mumbai, Delhi, Bangalore and Kolkata.',
      'Rogato Linhas Aéreas joins the alliance as the second airline from Dumont Group. The ' +
      'airline reinforces Mollweide\'s domestic Brazilian network and complements the ' +
      'international operations of Dumont, a Mollweide member.',
      'Mexicana adds further destinations across Mexico, Central America and the United States, ' +
      'providing further connectivity across the continent.',
      'AirLiban brings Beirut and Cairo as new hubs and represents the expansion of the network ' +
      'to North Africa and the Middle East.'
    ],
    quote:{
      paras:[
        'This is the largest group of airlines we have welcomed to Mollweide at one time. Each ' +
        'brings new destinations and connections for our passengers and our existing members.',
        'We are pleased to welcome Aranya Rukmanidoot, Rogato Linhas Aéreas, Mexicana and ' +
        'AirLiban to Mollweide.'
      ],
      who:'Guilherme Terra', role:'Chief Executive Officer, Mollweide Alliance'
    },
    after:[
      'Passengers will progressively gain access to alliance benefits, including reciprocal ' +
      'miles redemptions, member airline lounges and an expanded network of destinations.',
      'Further details on integration and reciprocal benefits will be announced in due course.'
    ]
  },
  {
    date:'2026-09-23', dateline:'Rio de Janeiro', tag:'Membership',
    title:'Mollweide welcomes Aloha Regional and Aranya Air to the alliance',
    standfirst:'Mollweide today announced Aranya Air and Aloha Regional, a subsidiary of ' +
               'existing Mollweide member Aloha Air, as new members of the alliance.',
    body:[
      'The addition of the new carriers substantially increases the group\'s presence across ' +
      'South Asia and the Pacific.',
      'Aranya Air brings a multi-hub network spanning Mumbai, Delhi, Bangalore, Hyderabad and ' +
      'Chennai, connecting Mollweide passengers with the growing South Asian market and beyond.',
      'Aloha Regional brings additional connectivity from its Kahului hub across the Pacific islands.',
      'Their entry continues Mollweide\'s strategy to expand global connectivity, increasing ' +
      'onward flights and destinations across markets of strategic importance to the alliance.'
    ],
    quote:{
      paras:[
        'Aranya Air and Aloha Regional strengthen our presence across two important regions ' +
        'while creating new opportunities for passengers to connect across the wider Mollweide network.',
        'We welcome their entry to the alliance as Mollweide continues to expand across the globe.'
      ],
      who:'Guilherme Terra', role:'Chief Executive Officer, Mollweide Alliance'
    },
    after:[
      'Passengers will progressively benefit from joining the alliance, such as reciprocal ' +
      'miles redemptions, access to member airlines\' lounges at hub airports and new destinations.',
      'Further details on integration, reciprocal benefits and participating routes will be ' +
      'announced by Mollweide and the respective airlines in due course.'
    ]
  }
];

/* ============================================================================
   HERO CITY ROTATION
   The homepage headline cycles pairs drawn from this list. These are display
   names only — to make a city bookable it also needs an entry in AIRPORTS.
   ========================================================================== */

const HERO_CITIES = [
  'Tbilisi', 'Baku', 'Yerevan', 'London', 'Lisbon', 'Madrid', 'Brasília', 'Rio de Janeiro',
  'São Paulo', 'Salvador', 'Quito', 'Galápagos Islands', 'Fernando de Noronha', 'Buenos Aires',
  'Erbil', 'Moscow', 'Sochi', 'Batumi', 'Mexico City', 'New York', 'Cleveland',
  'Washington DC', 'Kahului', 'Delhi', 'Bangalore', 'Mumbai', 'Chennai', 'Astrakhan',
  'Cape Town', 'Kigali', 'São Tomé', 'Maputo', 'Bridgetown', 'Córdoba', 'Belo Horizonte',
  'Dublin', 'Fortaleza', 'Florianópolis', 'Istanbul', 'Luanda', 'Los Angeles', 'Lagos',
  'Manaus', 'Maceió', 'Medellín', 'Milan', 'Rome', 'Montevideo', 'Punta Cana', 'Panama City',
  'Sal', 'Sydney', 'Uberlândia', 'Vitória', 'Asunción', 'Barcelona', 'Beirut', 'Jeddah',
  'Dubai', 'Riyadh', 'Lima', 'Kutaisi', 'Almaty', 'Tashkent', 'Samarkand', 'Dushanbe',
  'Bishkek', 'Shymkent', 'Kashi', 'Lahore', 'Faisalabad', 'Bhopal', 'Udaipur', 'Pune',
  'Thiruvananthapuram', 'Hyderabad', 'Nagpur', 'Kathmandu', 'Beijing', 'Hong Kong', 'Tokyo',
  'Bangkok', 'Koh Samui', 'Kuala Lumpur', 'Melbourne', 'Perth', 'Papeete', 'Guam', 'Monterrey',
  'Cancún', 'Guatemala City', 'Guadalajara', 'Miami', 'Dallas'
];


/* ============================================================================
   LOUNGES
   ----------------------------------------------------------------------------
   `operator` is a member airline code from MEMBERS. `photo` may be null — the
   finder then falls back to a panel in the operator's own colour, so a lounge
   without a photograph still looks deliberate.

   Lounge names below are invented; change them freely.
   ========================================================================== */

const LOUNGES = [
  {
    name:'Atlântico Lounge', operator:'DU', airport:'GIG',
    location:'Terminal 2, international pier, after security',
    hours:'05:00 – 23:30',
    photo:'assets/img/lounges/dumont-gig.jpg',
    access:['Business and First', 'Strata and Aurora members'],
    amenities:['À la carte dining','Shower suites','Ramp view','Quiet zone','Wi-Fi']
  },
  {
    name:'Paulista Lounge', operator:'DU', airport:'GRU',
    location:'Terminal 3, mezzanine level',
    hours:'05:30 – 23:00',
    photo:'assets/img/lounges/dumont-gig.jpg',   // Galeão photograph, reused here
    access:['Business and First', 'Strata and Aurora members'],
    amenities:['Buffet dining','Shower suites','Business desks','Wi-Fi']
  },
  {
    name:'Kangaroo Lounge', operator:'SJ', airport:'BNE',
    location:'International terminal, level 3, above the gate A concourse',
    hours:'04:30 – 23:00',
    photo:'assets/img/lounges/strayajet-bne.jpg',
    access:['Business and First', 'Strata and Aurora members'],
    amenities:['All-day dining','Shower suites','Apron view','Work booths','Wi-Fi']
  },
  {
    name:'Eagle\'s Nest', operator:'PL', airport:'WAW',
    location:'Terminal A, Schengen pier, after security',
    hours:'05:00 – 22:30',
    photo:'assets/img/lounges/polair-waw.jpg',
    access:['Business and First', 'Strata and Aurora members'],
    amenities:['Polish kitchen','Barista bar','Apron view','Quiet zone','Wi-Fi']
  },
  {
    name:'Marani Lounge', operator:'CS', airport:'TBS',
    location:'Departures level, opposite gate 4',
    hours:'04:00 – 22:00',
    photo:'assets/img/lounges/caucausair-tbs.jpg',
    access:['Business and First', 'Strata and Aurora members'],
    amenities:['Georgian wine bar','Hot kitchen','City and ramp view','Wi-Fi']
  }
];

/* ==========================================================================
   JOINING
   ----------------------------------------------------------------------------
   The two groups a player can apply to from inside the game. `search` is the
   exact string to type into the game's alliance search — it is reproduced
   character for character on join.html and must not be reworded.

   `accent` only tints the rule along the top of each card; both groups use
   the same mark and wordmark, because they are the same brand.
   ========================================================================== */

const JOIN = [
  {
    key:'alliance', name:'Mollweide Alliance', sub:'Alliance',
    accent:'#13398C',
    search:'frame-beyond-dropped',
    blurb:'Full membership. Member carriers appear on the member wall and the ' +
          'route map, operate alongside one another in flight search, and ' +
          'recognise Elara status and lounge access on every other member.'
  },
  {
    key:'connect', name:'Mollweide Connect', sub:'Connect',
    accent:'#4E9BD4',
    search:'smell-easily-go',
    // TODO: say here how Connect differs from full membership in game.
    blurb:'The alliance\'s second group, listed separately in game. Apply here ' +
          'if you have been directed to Connect rather than to the alliance ' +
          'itself.'
  }
];
