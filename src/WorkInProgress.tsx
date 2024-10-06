// src/WorkInProgress.tsx
import React from 'react';

const WorkInProgress: React.FC = () => {
  return (
    <div style={{ textAlign: 'center', marginTop: '10%' }}>
      <h1>Introduction to Project</h1>
      <p>Hello, and welcome to this website made by first year professional janitors.
        This ANT61 hackathon had placed us in a position to create a website that could make an accurate and interactive 
        visualisation of the position of the Beacon in space. The Beacon in essence is a monitor that allows for spacecraft satellites to transmit back information to assist with protocols
        regarding repair and maintenance, and must be able to to track real-time data for such Beacons. Throughout the past 24 hours, these professional janitors have done a lot of work to put
        together this website, which while barely functional, does provide a decent visualisation of the Beacon rotating around in space around a blue sphere. It also contains positional data, 
        in particular, location and rotational data, based on information it sends back. Included with this website is a bunch of simulated data that shows the trajectory of this Beacon.
        In future, it is probably advisable that these professional janitors actually learn how to program properly before joining a hackathon, but it was fun nonetheless.
      </p>
      <h2>Thank you for your time, and hav a nice day :3</h2>
    </div>
  );
};

export default WorkInProgress;
