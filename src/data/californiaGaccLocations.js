export const GACC_COORDINATION_CENTERS = {
  'North Ops': { name:'Northern California Geographic Area Coordination Center', city:'Redding', county:'Shasta County', lat:40.5865, lng:-122.3917 },
  'South Ops': { name:'Southern California Geographic Area Coordination Center', city:'Riverside', county:'Riverside County', lat:33.9806, lng:-117.3755 },
}

// Incident seeds are wildfire-area anchors, not city centers. Historical references are
// used only to select realistic terrain and WUI placement; exercises do not recreate the
// historical incident and generated incident names remain new.
export const CALIFORNIA_GACC_LOCATIONS = [
  {id:'oncc-carr-west-redding',gaccRegion:'North Ops',community:'Redding',city:'Redding',county:'Shasta County',area:'Whiskeytown and Clear Creek foothills west of Redding',terrain:'foothill WUI, chaparral and mixed conifer',historicalReference:'Carr Fire area',lat:40.6200,lng:-122.6200},
  {id:'oncc-camp-feather-river',gaccRegion:'North Ops',community:'Paradise',city:'Paradise',county:'Butte County',area:'Feather River Canyon and ridge country east of Paradise',terrain:'steep canyon, timber and WUI',historicalReference:'Camp Fire area',lat:39.7900,lng:-121.5700},
  {id:'oncc-dixie-canyon',gaccRegion:'North Ops',community:'Greenville',city:'Greenville',county:'Plumas County',area:'North Fork Feather River canyon and surrounding ridges',terrain:'steep timbered canyon and mountain communities',historicalReference:'Dixie Fire area',lat:40.0900,lng:-121.0600},
  {id:'oncc-mckinney-klamath',gaccRegion:'North Ops',community:'Yreka',city:'Yreka',county:'Siskiyou County',area:'Klamath River corridor northwest of Yreka',terrain:'river canyon, grass, brush and timber interface',historicalReference:'McKinney Fire area',lat:41.8500,lng:-122.9200},
  {id:'oncc-mendocino-clear-lake',gaccRegion:'North Ops',community:'Upper Lake',city:'Upper Lake',county:'Lake County',area:'foothills and drainages north of Clear Lake',terrain:'chaparral, oak woodland and rural WUI',historicalReference:'Mendocino Complex area',lat:39.1900,lng:-122.9100},
  {id:'oncc-lnu-berryessa',gaccRegion:'North Ops',community:'Napa',city:'Napa',county:'Napa County',area:'Lake Berryessa and eastern Napa County ridges',terrain:'steep chaparral, oak woodland and rural WUI',historicalReference:'LNU Lightning Complex area',lat:38.6400,lng:-122.2500},
  {id:'oncc-tubbs-calistoga',gaccRegion:'North Ops',community:'Calistoga',city:'Calistoga',county:'Napa County',area:'Mayacamas ridges northeast of Calistoga',terrain:'ridge-top brush, timber pockets and WUI',historicalReference:'Tubbs Fire area',lat:38.6500,lng:-122.6000},
  {id:'oncc-august-mendocino',gaccRegion:'North Ops',community:'Covelo',city:'Covelo',county:'Mendocino County',area:'Mendocino National Forest east of Covelo',terrain:'remote forest, steep ridges and limited access',historicalReference:'August Complex area',lat:39.7900,lng:-123.0200},
  {id:'oncc-river-plumas',gaccRegion:'North Ops',community:'Quincy',city:'Quincy',county:'Plumas County',area:'Middle Fork Feather River country southwest of Quincy',terrain:'timbered canyon and mountain WUI',historicalReference:'North Complex area',lat:39.8400,lng:-121.1500},
  {id:'oncc-mill-weed',gaccRegion:'North Ops',community:'Weed',city:'Weed',county:'Siskiyou County',area:'Shasta Valley foothills south of Weed',terrain:'grass, brush, timber and community interface',historicalReference:'Mill Fire area',lat:41.3600,lng:-122.3900},
  {id:'oncc-beckwourth-plumas',gaccRegion:'North Ops',community:'Portola',city:'Portola',county:'Plumas County',area:'Sierra Valley and Beckwourth Pass',terrain:'sage, grass, pine forest and transportation corridor',historicalReference:'Beckwourth Complex area',lat:39.8200,lng:-120.3700},
  {id:'oncc-monument-trinity',gaccRegion:'North Ops',community:'Weaverville',city:'Weaverville',county:'Trinity County',area:'Trinity River canyon west of Weaverville',terrain:'steep forested canyon and highway corridor',historicalReference:'Monument Fire area',lat:40.7400,lng:-123.2600},

  {id:'oscc-thomas-ojai',gaccRegion:'South Ops',community:'Ojai',city:'Ojai',county:'Ventura County',area:'Topatopa foothills and canyons north of Ojai',terrain:'chaparral, steep canyon and WUI',historicalReference:'Thomas Fire area',lat:34.5100,lng:-119.1800},
  {id:'oscc-woolsey-santa-monica',gaccRegion:'South Ops',community:'Agoura Hills',city:'Agoura Hills',county:'Los Angeles County',area:'Santa Monica Mountains west of Agoura Hills',terrain:'chaparral ridges, canyons and dense WUI',historicalReference:'Woolsey Fire area',lat:34.1000,lng:-118.8300},
  {id:'oscc-cedar-cuyamaca',gaccRegion:'South Ops',community:'Julian',city:'Julian',county:'San Diego County',area:'Cuyamaca and Cleveland National Forest southwest of Julian',terrain:'chaparral, oak woodland, timber and mountain WUI',historicalReference:'Cedar Fire area',lat:32.9800,lng:-116.6300},
  {id:'oscc-apple-cherry-valley',gaccRegion:'South Ops',community:'Beaumont',city:'Beaumont',county:'Riverside County',area:'Cherry Valley and San Bernardino National Forest foothills',terrain:'chaparral foothills and expanding WUI',historicalReference:'Apple Fire area',lat:33.9700,lng:-116.9700},
  {id:'oscc-holy-trabuco',gaccRegion:'South Ops',community:'Lake Elsinore',city:'Lake Elsinore',county:'Riverside County',area:'Trabuco Canyon and Santa Ana Mountains west of Lake Elsinore',terrain:'steep chaparral canyon and WUI',historicalReference:'Holy Fire area',lat:33.6600,lng:-117.4800},
  {id:'oscc-bobcat-angeles',gaccRegion:'South Ops',community:'Monrovia',city:'Monrovia',county:'Los Angeles County',area:'Angeles National Forest north of the San Gabriel Valley',terrain:'steep chaparral and timbered mountain front',historicalReference:'Bobcat Fire area',lat:34.2400,lng:-117.8800},
  {id:'oscc-creek-shaver',gaccRegion:'South Ops',community:'Shaver Lake',city:'Shaver Lake',county:'Fresno County',area:'Sierra National Forest and Big Creek drainage',terrain:'steep mixed-conifer forest and mountain communities',historicalReference:'Creek Fire area',lat:37.1100,lng:-119.2600},
  {id:'oscc-erskine-lake-isabella',gaccRegion:'South Ops',community:'Lake Isabella',city:'Lake Isabella',county:'Kern County',area:'Kern River Valley and foothills east of Lake Isabella',terrain:'grass, brush, steep foothills and rural WUI',historicalReference:'Erskine Fire area',lat:35.6100,lng:-118.4500},
  {id:'oscc-station-angeles',gaccRegion:'South Ops',community:'La Cañada Flintridge',city:'La Cañada Flintridge',county:'Los Angeles County',area:'Angeles National Forest north of La Cañada Flintridge',terrain:'steep chaparral, canyon and urban interface',historicalReference:'Station Fire area',lat:34.3000,lng:-118.1500},
  {id:'oscc-fairview-hemet',gaccRegion:'South Ops',community:'Hemet',city:'Hemet',county:'Riverside County',area:'foothills southeast of Hemet near the San Jacinto Mountains',terrain:'chaparral foothills and rural WUI',historicalReference:'Fairview Fire area',lat:33.6400,lng:-116.9200},
  {id:'oscc-blue-cut-cajon',gaccRegion:'South Ops',community:'San Bernardino',city:'San Bernardino',county:'San Bernardino County',area:'Cajon Pass and eastern San Gabriel foothills',terrain:'chaparral, transportation corridor and mountain WUI',historicalReference:'Blue Cut Fire area',lat:34.3100,lng:-117.4300},
  {id:'oscc-laguna-mt-empire',gaccRegion:'South Ops',community:'Pine Valley',city:'Pine Valley',county:'San Diego County',area:'Laguna Mountains and Cleveland National Forest',terrain:'chaparral, oak woodland, timber and mountain communities',historicalReference:'Laguna Fire area',lat:32.8400,lng:-116.5200},
]

export function locationsForGacc(gaccRegion){
  return CALIFORNIA_GACC_LOCATIONS.filter(item=>item.gaccRegion===gaccRegion)
}

export function selectGaccIncidentSeeds(gaccRegion,count=3,random=Math.random){
  const pool=[...locationsForGacc(gaccRegion)]
  for(let i=pool.length-1;i>0;i-=1){
    const j=Math.floor(random()*(i+1))
    ;[pool[i],pool[j]]=[pool[j],pool[i]]
  }
  const selected=[]
  for(const candidate of pool){
    if(selected.every(existing=>distanceMiles(candidate.lat,candidate.lng,existing.lat,existing.lng)>=30)) selected.push(candidate)
    if(selected.length>=Math.max(2,Math.min(5,count))) break
  }
  return selected.length>=2?selected:pool.slice(0,Math.max(2,Math.min(5,count)))
}

export function distanceMiles(aLat,aLng,bLat,bLng){
  const toRad=value=>value*Math.PI/180
  const earth=3958.8
  const dLat=toRad(bLat-aLat)
  const dLng=toRad(bLng-aLng)
  const x=Math.sin(dLat/2)**2+Math.cos(toRad(aLat))*Math.cos(toRad(bLat))*Math.sin(dLng/2)**2
  return 2*earth*Math.asin(Math.sqrt(x))
}

export function incidentMatchesGacc(incident,gaccRegion,maxMiles=18){
  const lat=Number(incident?.lat)
  const lng=Number(incident?.lng)
  if(!Number.isFinite(lat)||!Number.isFinite(lng)) return false
  return locationsForGacc(gaccRegion).some(location=>distanceMiles(lat,lng,location.lat,location.lng)<=maxMiles)
}

export function incidentMatchesSelectedSeed(incident,seeds=[],maxMiles=8){
  const lat=Number(incident?.lat)
  const lng=Number(incident?.lng)
  if(!Number.isFinite(lat)||!Number.isFinite(lng)) return false
  const seedId=incident?.locationSeedId
  const seed=seeds.find(item=>item.id===seedId)
  if(!seed) return false
  return distanceMiles(lat,lng,seed.lat,seed.lng)<=maxMiles
}
