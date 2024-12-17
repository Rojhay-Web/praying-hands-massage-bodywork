import { useEffect, useState } from 'react';

import type { LatLngTuple } from 'leaflet';
import L from 'leaflet';
import { MapContainer, TileLayer, Marker  } from 'react-leaflet';

type LocationType = {
    show: boolean, title: string, mark: LatLngTuple
}

const position:LatLngTuple = [39.4359383,-75.6295269], zoom: number = 9.25,
    icon = L.icon({ iconUrl: "/images/marker-icon.png" });

const markers: LatLngTuple[] = [
    [39.448280, -75.716669], // Middletown, DE
    [39.746218, -75.548481], // Wilmington, DE
    [39.578624, -75.594368], // Delaware City, DE
    [39.681885, -75.753538], // Newark, DE
    [39.296962, -75.606399], // Smyrna, DE
    [39.185133, -75.526127], // Dover, DE
];

const locations: LocationType[] = [
    { show:true, title: "Middletown, DE", mark: [39.448280, -75.716669]},
    { show:true, title: "Wilmington, DE", mark: [39.746218, -75.548481]},
    { show:true, title: "Delaware City, DE", mark: [39.578624, -75.594368]},
    { show:true, title: "Newark, DE", mark: [39.681885, -75.753538]},
    { show:true, title: "Smyrna, DE", mark: [39.296962, -75.606399]},
    { show:true, title: "Dover, DE", mark: [39.185133, -75.526127]},

    { show:false, title: "New Castle County, DE", mark:[0,0]},
    { show:false, title: "Kent County, DE", mark:[0,0]},
    { show:false, title: "Greater Delaware Area", mark:[0,0]},
    { show:false, title: "Maryland", mark:[0,0]}
];

function AreaMap(){
    const [markers, setMarkers] = useState<LatLngTuple[] | undefined>([]);

    useEffect(()=> {
        if(locations?.length > 0){
            let tmpLoc = locations
                .filter((loc) => { return loc.show; })
                .map((loc)=> { return loc.mark; });

            setMarkers(tmpLoc);
        }
    },[locations]);
    
    return(
        <>
            <div className='location-list-container'>
                <div className='location-list'>
                    {locations.map((loc,i) =>
                        <div className='location-pill' key={i}>{loc.title}</div>
                    )}
                </div>
            </div>
            <div className='area-map'>
                <MapContainer center={position} zoom={zoom} scrollWheelZoom={false}
                    style={{ width: "100%", height: "400px" }} zoomControl={false}>
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    {markers && markers?.length > 0 ?
                        <>
                            {markers.map((mark,i) =>
                                <Marker position={mark} icon={icon} key={i} />
                            )}
                        </> : <></>
                    }
                </MapContainer>
            </div>
        </>
    );
}

export default AreaMap;