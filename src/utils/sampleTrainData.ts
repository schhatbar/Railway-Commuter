import { doc, setDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { Train } from '../types';

/**
 * Sample train data for testing the application
 * This includes common Indian railway trains with realistic coach configurations
 */
export const sampleTrains: Train[] = [
  {
    trainNumber: '12301',
    trainName: 'Rajdhani Express',
    route: 'New Delhi - Howrah',
    coaches: [
      { coachType: 'firstClass', coachNumber: 'H1', totalSeats: 18, platformPosition: 50 },
      { coachType: 'ac', coachNumber: 'A1', totalSeats: 64, platformPosition: 100 },
      { coachType: 'ac', coachNumber: 'A2', totalSeats: 64, platformPosition: 150 },
      { coachType: 'ac', coachNumber: 'A3', totalSeats: 64, platformPosition: 200 },
      { coachType: 'ac', coachNumber: 'B1', totalSeats: 72, platformPosition: 250 },
      { coachType: 'ac', coachNumber: 'B2', totalSeats: 72, platformPosition: 300 },
      { coachType: 'ac', coachNumber: 'B3', totalSeats: 72, platformPosition: 350 },
      { coachType: 'ac', coachNumber: 'B4', totalSeats: 72, platformPosition: 400 },
    ]
  },
  {
    trainNumber: '12951',
    trainName: 'Mumbai Rajdhani',
    route: 'Mumbai Central - New Delhi',
    coaches: [
      { coachType: 'firstClass', coachNumber: 'H1', totalSeats: 18, platformPosition: 50 },
      { coachType: 'ac', coachNumber: 'A1', totalSeats: 64, platformPosition: 100 },
      { coachType: 'ac', coachNumber: 'A2', totalSeats: 64, platformPosition: 150 },
      { coachType: 'ac', coachNumber: 'B1', totalSeats: 72, platformPosition: 200 },
      { coachType: 'ac', coachNumber: 'B2', totalSeats: 72, platformPosition: 250 },
      { coachType: 'ac', coachNumber: 'B3', totalSeats: 72, platformPosition: 300 },
    ]
  },
  {
    trainNumber: '12273',
    trainName: 'Duronto Express',
    route: 'New Delhi - Howrah',
    coaches: [
      { coachType: 'ac', coachNumber: 'A1', totalSeats: 64, platformPosition: 50 },
      { coachType: 'ac', coachNumber: 'A2', totalSeats: 64, platformPosition: 100 },
      { coachType: 'ac', coachNumber: 'B1', totalSeats: 72, platformPosition: 150 },
      { coachType: 'ac', coachNumber: 'B2', totalSeats: 72, platformPosition: 200 },
      { coachType: 'ac', coachNumber: 'B3', totalSeats: 72, platformPosition: 250 },
      { coachType: 'sleeper', coachNumber: 'S1', totalSeats: 72, platformPosition: 300 },
      { coachType: 'sleeper', coachNumber: 'S2', totalSeats: 72, platformPosition: 350 },
      { coachType: 'sleeper', coachNumber: 'S3', totalSeats: 72, platformPosition: 400 },
    ]
  },
  {
    trainNumber: '12423',
    trainName: 'Dibrugarh Rajdhani',
    route: 'New Delhi - Dibrugarh',
    coaches: [
      { coachType: 'firstClass', coachNumber: 'H1', totalSeats: 18, platformPosition: 50 },
      { coachType: 'ac', coachNumber: 'A1', totalSeats: 64, platformPosition: 100 },
      { coachType: 'ac', coachNumber: 'A2', totalSeats: 64, platformPosition: 150 },
      { coachType: 'ac', coachNumber: 'B1', totalSeats: 72, platformPosition: 200 },
      { coachType: 'ac', coachNumber: 'B2', totalSeats: 72, platformPosition: 250 },
      { coachType: 'ac', coachNumber: 'B3', totalSeats: 72, platformPosition: 300 },
      { coachType: 'ac', coachNumber: 'B4', totalSeats: 72, platformPosition: 350 },
    ]
  },
  {
    trainNumber: '12626',
    trainName: 'Kerala Express',
    route: 'New Delhi - Trivandrum',
    coaches: [
      { coachType: 'ac', coachNumber: 'A1', totalSeats: 64, platformPosition: 50 },
      { coachType: 'ac', coachNumber: 'A2', totalSeats: 64, platformPosition: 100 },
      { coachType: 'ac', coachNumber: 'B1', totalSeats: 72, platformPosition: 150 },
      { coachType: 'sleeper', coachNumber: 'S1', totalSeats: 72, platformPosition: 200 },
      { coachType: 'sleeper', coachNumber: 'S2', totalSeats: 72, platformPosition: 250 },
      { coachType: 'sleeper', coachNumber: 'S3', totalSeats: 72, platformPosition: 300 },
      { coachType: 'sleeper', coachNumber: 'S4', totalSeats: 72, platformPosition: 350 },
      { coachType: 'sleeper', coachNumber: 'S5', totalSeats: 72, platformPosition: 400 },
      { coachType: 'general', coachNumber: 'GS1', totalSeats: 108, platformPosition: 450 },
      { coachType: 'general', coachNumber: 'GS2', totalSeats: 108, platformPosition: 500 },
    ]
  },
  {
    trainNumber: '12002',
    trainName: 'Bhopal Shatabdi',
    route: 'New Delhi - Bhopal',
    coaches: [
      { coachType: 'ac', coachNumber: 'CC1', totalSeats: 78, platformPosition: 50 },
      { coachType: 'ac', coachNumber: 'CC2', totalSeats: 78, platformPosition: 100 },
      { coachType: 'ac', coachNumber: 'CC3', totalSeats: 78, platformPosition: 150 },
      { coachType: 'ac', coachNumber: 'CC4', totalSeats: 78, platformPosition: 200 },
      { coachType: 'ac', coachNumber: 'CC5', totalSeats: 78, platformPosition: 250 },
    ]
  },
  {
    trainNumber: '12430',
    trainName: 'Lucknow AC Express',
    route: 'New Delhi - Lucknow',
    coaches: [
      { coachType: 'ac', coachNumber: 'A1', totalSeats: 64, platformPosition: 50 },
      { coachType: 'ac', coachNumber: 'A2', totalSeats: 64, platformPosition: 100 },
      { coachType: 'ac', coachNumber: 'B1', totalSeats: 72, platformPosition: 150 },
      { coachType: 'ac', coachNumber: 'B2', totalSeats: 72, platformPosition: 200 },
      { coachType: 'sleeper', coachNumber: 'S1', totalSeats: 72, platformPosition: 250 },
      { coachType: 'sleeper', coachNumber: 'S2', totalSeats: 72, platformPosition: 300 },
      { coachType: 'sleeper', coachNumber: 'S3', totalSeats: 72, platformPosition: 350 },
    ]
  }
];

/**
 * Function to upload sample train data to Firestore
 * Run this once to populate the database with sample trains
 */
export const uploadSampleTrainData = async () => {
  try {
    console.log('Starting to upload sample train data...');

    for (const train of sampleTrains) {
      const trainRef = doc(db, 'trains', train.trainNumber);
      await setDoc(trainRef, train);
      console.log(`Uploaded: ${train.trainName} (${train.trainNumber})`);
    }

    console.log('Successfully uploaded all sample train data!');
    return { success: true, count: sampleTrains.length };
  } catch (error) {
    console.error('Error uploading sample train data:', error);
    return { success: false, error };
  }
};
