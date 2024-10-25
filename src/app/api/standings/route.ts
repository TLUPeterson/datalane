import { NextResponse } from 'next/server'
import { parseString } from 'xml2js'
import { promisify } from 'util'

const parseXML = promisify(parseString)

async function getStandings() {
  try {
    // Fetch all data in parallel
    const [driversResponse, constructorsResponse, lastRaceResponse] = await Promise.all([
      fetch('http://ergast.com/api/f1/current/driverStandings'),
      fetch('http://ergast.com/api/f1/current/constructorStandings'),
      fetch('http://ergast.com/api/f1/current/last/results')
    ]);

    // Parse all XML responses
    const [driversXml, constructorsXml, lastRaceXml] = await Promise.all([
      driversResponse.text(),
      constructorsResponse.text(),
      lastRaceResponse.text()
    ]);

    // Parse XML to JSON
    const [driversData, constructorsData, lastRaceData] = await Promise.all([
      parseXML(driversXml),
      parseXML(constructorsXml),
      parseXML(lastRaceXml)
    ]);

    // Process drivers standings
    const driverStandings = driversData.MRData.StandingsTable[0].StandingsList[0].DriverStanding;
    const drivers = driverStandings.map((driverNode: any) => ({
      position: parseInt(driverNode.$.position),
      points: parseInt(driverNode.$.points),
      lastRacePoints: 0,
      driver: driverNode.Driver[0].FamilyName[0],
      constructor: driverNode.Constructor[0].Name[0]
    }));

    // Process constructors standings
    const constructorStandings = constructorsData.MRData.StandingsTable[0].StandingsList[0].ConstructorStanding;
    const constructors = constructorStandings.map((node: any) => ({
      position: parseInt(node.$.position),
      points: parseInt(node.$.points),
      lastRacePoints: 0,
      name: node.Constructor[0].Name[0]
    }));

    // Process last race results
    const raceResults = lastRaceData.MRData.RaceTable[0].Race[0].ResultsList[0].Result;
    const lastRaceResults = raceResults.map((resultNode: any) => ({
      driver: resultNode.Driver[0].FamilyName[0],
      points: parseInt(resultNode.$.points),
      constructor: resultNode.Constructor[0].Name[0]
    }));

    // Update drivers with last race points
    const updatedDrivers = drivers.map(driver => {
      const lastRaceResult = lastRaceResults.find(result => result.driver === driver.driver);
      return {
        ...driver,
        lastRacePoints: lastRaceResult ? lastRaceResult.points : 0,
      };
    });

    // Update constructors with last race points
    const updatedConstructors = constructors.map(constructor => {
      const totalPoints = lastRaceResults
        .filter(result => result.constructor === constructor.name)
        .reduce((sum, result) => sum + result.points, 0);
      return {
        ...constructor,
        lastRacePoints: totalPoints,
      };
    });

    return {
      drivers: updatedDrivers,
      constructors: updatedConstructors
    };
  } catch (error) {
    console.error('Failed to fetch standings:', error);
    throw error;
  }
}

export async function GET() {
  try {
    const data = await getStandings()
    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400'
      },
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch standings' },
      { status: 500 }
    )
  }
}