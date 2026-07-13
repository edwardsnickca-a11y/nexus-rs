export const GACC_COORDINATION_CENTERS = {
  'North Ops': { name:'Northern California Geographic Area Coordination Center', city:'Redding', county:'Shasta County', lat:40.5865, lng:-122.3917 },
  'South Ops': { name:'Southern California Geographic Area Coordination Center', city:'Riverside', county:'Riverside County', lat:33.9806, lng:-117.3755 },
}

export const CALIFORNIA_GACC_LOCATIONS = [
  {id:'oncc-redding',gaccRegion:'North Ops',city:'Redding',county:'Shasta County',area:'northern Sacramento Valley and surrounding foothills',lat:40.5865,lng:-122.3917},
  {id:'oncc-weaverville',gaccRegion:'North Ops',city:'Weaverville',county:'Trinity County',area:'Trinity Alps foothills',lat:40.7307,lng:-122.9419},
  {id:'oncc-yreka',gaccRegion:'North Ops',city:'Yreka',county:'Siskiyou County',area:'Shasta Valley',lat:41.7354,lng:-122.6345},
  {id:'oncc-susanville',gaccRegion:'North Ops',city:'Susanville',county:'Lassen County',area:'Honey Lake region',lat:40.4163,lng:-120.6530},
  {id:'oncc-quincy',gaccRegion:'North Ops',city:'Quincy',county:'Plumas County',area:'American Valley and northern Sierra',lat:39.9368,lng:-120.9472},
  {id:'oncc-ukiah',gaccRegion:'North Ops',city:'Ukiah',county:'Mendocino County',area:'Russian River valley and coastal ranges',lat:39.1502,lng:-123.2078},
  {id:'oncc-santa-rosa',gaccRegion:'North Ops',city:'Santa Rosa',county:'Sonoma County',area:'North Bay wildland-urban interface',lat:38.4405,lng:-122.7144},
  {id:'oncc-napa',gaccRegion:'North Ops',city:'Napa',county:'Napa County',area:'wine-country foothills',lat:38.2975,lng:-122.2869},
  {id:'oncc-auburn',gaccRegion:'North Ops',city:'Auburn',county:'Placer County',area:'western Sierra foothills',lat:38.8966,lng:-121.0769},
  {id:'oncc-truckee',gaccRegion:'North Ops',city:'Truckee',county:'Nevada County',area:'Sierra crest and Interstate 80 corridor',lat:39.3279,lng:-120.1833},
  {id:'oncc-alturas',gaccRegion:'North Ops',city:'Alturas',county:'Modoc County',area:'Modoc Plateau',lat:41.4871,lng:-120.5425},
  {id:'oncc-willits',gaccRegion:'North Ops',city:'Willits',county:'Mendocino County',area:'northern coastal ranges',lat:39.4096,lng:-123.3556},

  {id:'oscc-riverside',gaccRegion:'South Ops',city:'Riverside',county:'Riverside County',area:'Inland Empire wildland-urban interface',lat:33.9806,lng:-117.3755},
  {id:'oscc-san-bernardino',gaccRegion:'South Ops',city:'San Bernardino',county:'San Bernardino County',area:'San Bernardino Mountains foothills',lat:34.1083,lng:-117.2898},
  {id:'oscc-idyllwild',gaccRegion:'South Ops',city:'Idyllwild',county:'Riverside County',area:'San Jacinto Mountains',lat:33.7442,lng:-116.7259},
  {id:'oscc-ramona',gaccRegion:'South Ops',city:'Ramona',county:'San Diego County',area:'San Diego backcountry',lat:33.0417,lng:-116.8681},
  {id:'oscc-julian',gaccRegion:'South Ops',city:'Julian',county:'San Diego County',area:'Peninsular Ranges',lat:33.0787,lng:-116.6019},
  {id:'oscc-ojai',gaccRegion:'South Ops',city:'Ojai',county:'Ventura County',area:'Topatopa foothills',lat:34.4480,lng:-119.2429},
  {id:'oscc-santa-clarita',gaccRegion:'South Ops',city:'Santa Clarita',county:'Los Angeles County',area:'northern Los Angeles County wildland-urban interface',lat:34.3917,lng:-118.5426},
  {id:'oscc-santa-barbara',gaccRegion:'South Ops',city:'Santa Barbara',county:'Santa Barbara County',area:'south coast mountains',lat:34.4208,lng:-119.6982},
  {id:'oscc-tehachapi',gaccRegion:'South Ops',city:'Tehachapi',county:'Kern County',area:'Tehachapi Mountains',lat:35.1322,lng:-118.4489},
  {id:'oscc-bakersfield',gaccRegion:'South Ops',city:'Bakersfield',county:'Kern County',area:'southern Sierra and Tehachapi foothills',lat:35.3733,lng:-119.0187},
  {id:'oscc-bishop',gaccRegion:'South Ops',city:'Bishop',county:'Inyo County',area:'eastern Sierra and Owens Valley',lat:37.3614,lng:-118.3997},
  {id:'oscc-lake-elsinore',gaccRegion:'South Ops',city:'Lake Elsinore',county:'Riverside County',area:'Santa Ana Mountains and Inland Empire interface',lat:33.6681,lng:-117.3273},
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
  return pool.slice(0,Math.max(2,Math.min(5,count)))
}

export function distanceMiles(aLat,aLng,bLat,bLng){
  const toRad=value=>value*Math.PI/180
  const earth=3958.8
  const dLat=toRad(bLat-aLat)
  const dLng=toRad(bLng-aLng)
  const x=Math.sin(dLat/2)**2+Math.cos(toRad(aLat))*Math.cos(toRad(bLat))*Math.sin(dLng/2)**2
  return 2*earth*Math.asin(Math.sqrt(x))
}

export function incidentMatchesGacc(incident,gaccRegion,maxMiles=40){
  const lat=Number(incident?.lat)
  const lng=Number(incident?.lng)
  if(!Number.isFinite(lat)||!Number.isFinite(lng)) return false
  return locationsForGacc(gaccRegion).some(location=>distanceMiles(lat,lng,location.lat,location.lng)<=maxMiles)
}
