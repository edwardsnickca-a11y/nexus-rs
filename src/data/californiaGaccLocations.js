export const GACC_COORDINATION_CENTERS = {
  'North Ops': { name:'Northern California Geographic Area Coordination Center', city:'Redding', county:'Shasta County', lat:40.5865, lng:-122.3917 },
  'South Ops': { name:'Southern California Geographic Area Coordination Center', city:'Riverside', county:'Riverside County', lat:33.9806, lng:-117.3755 },
}

// These are generalized wildfire-terrain zones, not historical incident recreations.
// Each exercise randomly selects zones and then offsets the incident point within the
// approved terrain area so the same community does not always produce the same fire.
export const CALIFORNIA_GACC_LOCATIONS = [
  {id:'oncc-clear-creek-foothills',gaccRegion:'North Ops',community:'Redding',city:'Redding',county:'Shasta County',area:'Clear Creek and Whiskeytown foothills west of Redding',terrain:'foothill WUI, chaparral and mixed conifer',lat:40.6200,lng:-122.6200,radiusMiles:6},
  {id:'oncc-feather-river-ridges',gaccRegion:'North Ops',community:'Paradise',city:'Paradise',county:'Butte County',area:'Feather River Canyon and ridge country east of Paradise',terrain:'steep canyon, timber and WUI',lat:39.7900,lng:-121.5700,radiusMiles:7},
  {id:'oncc-north-fork-feather',gaccRegion:'North Ops',community:'Greenville',city:'Greenville',county:'Plumas County',area:'North Fork Feather River canyon and surrounding ridges',terrain:'steep timbered canyon and mountain communities',lat:40.0900,lng:-121.0600,radiusMiles:7},
  {id:'oncc-klamath-corridor',gaccRegion:'North Ops',community:'Yreka',city:'Yreka',county:'Siskiyou County',area:'Klamath River corridor northwest of Yreka',terrain:'river canyon, grass, brush and timber interface',lat:41.8500,lng:-122.9200,radiusMiles:8},
  {id:'oncc-clear-lake-north',gaccRegion:'North Ops',community:'Upper Lake',city:'Upper Lake',county:'Lake County',area:'foothills and drainages north of Clear Lake',terrain:'chaparral, oak woodland and rural WUI',lat:39.1900,lng:-122.9100,radiusMiles:7},
  {id:'oncc-berryessa-ridges',gaccRegion:'North Ops',community:'Napa',city:'Napa',county:'Napa County',area:'Lake Berryessa and eastern Napa County ridges',terrain:'steep chaparral, oak woodland and rural WUI',lat:38.6400,lng:-122.2500,radiusMiles:7},
  {id:'oncc-mayacamas-north',gaccRegion:'North Ops',community:'Calistoga',city:'Calistoga',county:'Napa County',area:'Mayacamas ridges northeast of Calistoga',terrain:'ridge-top brush, timber pockets and WUI',lat:38.6500,lng:-122.6000,radiusMiles:6},
  {id:'oncc-mendocino-east',gaccRegion:'North Ops',community:'Covelo',city:'Covelo',county:'Mendocino County',area:'Mendocino National Forest east of Covelo',terrain:'remote forest, steep ridges and limited access',lat:39.7900,lng:-123.0200,radiusMiles:9},
  {id:'oncc-middle-fork-feather',gaccRegion:'North Ops',community:'Quincy',city:'Quincy',county:'Plumas County',area:'Middle Fork Feather River country southwest of Quincy',terrain:'timbered canyon and mountain WUI',lat:39.8400,lng:-121.1500,radiusMiles:7},
  {id:'oncc-shasta-valley-south',gaccRegion:'North Ops',community:'Weed',city:'Weed',county:'Siskiyou County',area:'Shasta Valley foothills south of Weed',terrain:'grass, brush, timber and community interface',lat:41.3600,lng:-122.3900,radiusMiles:7},
  {id:'oncc-beckwourth-pass',gaccRegion:'North Ops',community:'Portola',city:'Portola',county:'Plumas County',area:'Sierra Valley and Beckwourth Pass',terrain:'sage, grass, pine forest and transportation corridor',lat:39.8200,lng:-120.3700,radiusMiles:8},
  {id:'oncc-trinity-river-west',gaccRegion:'North Ops',community:'Weaverville',city:'Weaverville',county:'Trinity County',area:'Trinity River canyon west of Weaverville',terrain:'steep forested canyon and highway corridor',lat:40.7400,lng:-123.2600,radiusMiles:8},

  {id:'oscc-topatopa-foothills',gaccRegion:'South Ops',community:'Ojai',city:'Ojai',county:'Ventura County',area:'Topatopa foothills and canyons north of Ojai',terrain:'chaparral, steep canyon and WUI',lat:34.5100,lng:-119.1800,radiusMiles:7},
  {id:'oscc-santa-monica-west',gaccRegion:'South Ops',community:'Agoura Hills',city:'Agoura Hills',county:'Los Angeles County',area:'Santa Monica Mountains west of Agoura Hills',terrain:'chaparral ridges, canyons and dense WUI',lat:34.1000,lng:-118.8300,radiusMiles:6},
  {id:'oscc-cuyamaca-forest',gaccRegion:'South Ops',community:'Julian',city:'Julian',county:'San Diego County',area:'Cuyamaca and Cleveland National Forest southwest of Julian',terrain:'chaparral, oak woodland, timber and mountain WUI',lat:32.9800,lng:-116.6300,radiusMiles:8},
  {id:'oscc-cherry-valley-north',gaccRegion:'South Ops',community:'Beaumont',city:'Beaumont',county:'Riverside County',area:'North Cherry Valley and the foothills north of Beaumont',terrain:'chaparral foothills and wildland-urban interface outside the developed city grid',lat:34.0280,lng:-116.9260,radiusMiles:5},
  {id:'oscc-trabuco-canyon',gaccRegion:'South Ops',community:'Lake Elsinore',city:'Lake Elsinore',county:'Riverside County',area:'Trabuco Canyon and Santa Ana Mountains west of Lake Elsinore',terrain:'steep chaparral canyon and WUI',lat:33.6600,lng:-117.4800,radiusMiles:7},
  {id:'oscc-angeles-east',gaccRegion:'South Ops',community:'Monrovia',city:'Monrovia',county:'Los Angeles County',area:'Angeles National Forest north of the San Gabriel Valley',terrain:'steep chaparral and timbered mountain front',lat:34.2400,lng:-117.8800,radiusMiles:7},
  {id:'oscc-big-creek-drainage',gaccRegion:'South Ops',community:'Shaver Lake',city:'Shaver Lake',county:'Fresno County',area:'Sierra National Forest and Big Creek drainage',terrain:'steep mixed-conifer forest and mountain communities',lat:37.1100,lng:-119.2600,radiusMiles:8},
  {id:'oscc-kern-river-foothills',gaccRegion:'South Ops',community:'Lake Isabella',city:'Lake Isabella',county:'Kern County',area:'Kern River Valley and foothills east of Lake Isabella',terrain:'grass, brush, steep foothills and rural WUI',lat:35.6100,lng:-118.4500,radiusMiles:8},
  {id:'oscc-angeles-south-front',gaccRegion:'South Ops',community:'La Cañada Flintridge',city:'La Cañada Flintridge',county:'Los Angeles County',area:'Angeles National Forest north of La Cañada Flintridge',terrain:'steep chaparral, canyon and urban interface',lat:34.3000,lng:-118.1500,radiusMiles:6},
  {id:'oscc-san-jacinto-west',gaccRegion:'South Ops',community:'Hemet',city:'Hemet',county:'Riverside County',area:'foothills southeast of Hemet near the San Jacinto Mountains',terrain:'chaparral foothills and rural WUI',lat:33.6400,lng:-116.9200,radiusMiles:7},
  {id:'oscc-cajon-pass',gaccRegion:'South Ops',community:'San Bernardino',city:'San Bernardino',county:'San Bernardino County',area:'Cajon Pass and eastern San Gabriel foothills',terrain:'chaparral, transportation corridor and mountain WUI',lat:34.3100,lng:-117.4300,radiusMiles:7},
  {id:'oscc-laguna-mountains',gaccRegion:'South Ops',community:'Pine Valley',city:'Pine Valley',county:'San Diego County',area:'Laguna Mountains and Cleveland National Forest',terrain:'chaparral, oak woodland, timber and mountain communities',lat:32.8400,lng:-116.5200,radiusMiles:8},
]

export function locationsForGacc(gaccRegion){
  return CALIFORNIA_GACC_LOCATIONS.filter(item=>item.gaccRegion===gaccRegion)
}

function randomizedPoint(zone,random=Math.random){
  const radius=Math.max(1,Number(zone.radiusMiles)||5)
  const distance=Math.sqrt(random())*radius
  const bearing=random()*Math.PI*2
  const latOffset=(distance/69)*Math.cos(bearing)
  const lngScale=Math.max(.2,Math.cos(zone.lat*Math.PI/180))
  const lngOffset=(distance/(69*lngScale))*Math.sin(bearing)
  return {
    ...zone,
    id:`${zone.id}-${Math.floor(random()*1e8).toString(36)}`,
    zoneId:zone.id,
    lat:Number((zone.lat+latOffset).toFixed(5)),
    lng:Number((zone.lng+lngOffset).toFixed(5)),
  }
}

export function selectGaccIncidentSeeds(gaccRegion,count=3,random=Math.random){
  const pool=[...locationsForGacc(gaccRegion)]
  for(let i=pool.length-1;i>0;i-=1){
    const j=Math.floor(random()*(i+1))
    ;[pool[i],pool[j]]=[pool[j],pool[i]]
  }
  const selected=[]
  for(const candidate of pool){
    if(selected.every(existing=>distanceMiles(candidate.lat,candidate.lng,existing.lat,existing.lng)>=30)){
      selected.push(randomizedPoint(candidate,random))
    }
    if(selected.length>=Math.max(2,Math.min(5,count))) break
  }
  if(selected.length>=2) return selected
  return pool.slice(0,Math.max(2,Math.min(5,count))).map(item=>randomizedPoint(item,random))
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
  return locationsForGacc(gaccRegion).some(location=>distanceMiles(lat,lng,location.lat,location.lng)<=Math.max(maxMiles,Number(location.radiusMiles)||0))
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
