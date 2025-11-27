import { Train } from '../../src/types';

// Sample train data for Indian Railways
// You can expand this list with actual train data
export const trainsData: Omit<Train, 'trainNumber'>[] = [
  {
    trainName: 'Rajdhani Express',
    route: 'Mumbai Central - New Delhi',
    trainNumber: '12951',
    departureTime: '16:55',
    arrivalTime: '08:35',
    totalCabins: 18,
    seatsPerCabin: 72
  },
  {
    trainName: 'Shatabdi Express',
    route: 'New Delhi - Bhopal',
    trainNumber: '12001',
    departureTime: '06:00',
    arrivalTime: '13:55',
    totalCabins: 12,
    seatsPerCabin: 78
  },
  {
    trainName: 'Duronto Express',
    route: 'Mumbai - Howrah',
    trainNumber: '12261',
    departureTime: '12:40',
    arrivalTime: '11:35',
    totalCabins: 20,
    seatsPerCabin: 72
  },
  {
    trainName: 'Garib Rath Express',
    route: 'Mumbai - Patna',
    trainNumber: '12141',
    departureTime: '11:30',
    arrivalTime: '18:00',
    totalCabins: 16,
    seatsPerCabin: 72
  },
  {
    trainName: 'Humsafar Express',
    route: 'Delhi - Bangalore',
    trainNumber: '12649',
    departureTime: '20:50',
    arrivalTime: '05:30',
    totalCabins: 15,
    seatsPerCabin: 64
  },
  {
    trainName: 'Vande Bharat Express',
    route: 'New Delhi - Varanasi',
    trainNumber: '22435',
    departureTime: '06:00',
    arrivalTime: '14:00',
    totalCabins: 14,
    seatsPerCabin: 78
  },
  {
    trainName: 'Gatimaan Express',
    route: 'Hazrat Nizamuddin - Agra',
    trainNumber: '12049',
    departureTime: '08:10',
    arrivalTime: '09:50',
    totalCabins: 10,
    seatsPerCabin: 56
  },
  {
    trainName: 'Double Decker Express',
    route: 'Mumbai - Ahmedabad',
    trainNumber: '12931',
    departureTime: '06:55',
    arrivalTime: '13:30',
    totalCabins: 8,
    seatsPerCabin: 120
  },
  {
    trainName: 'Jan Shatabdi Express',
    route: 'Chennai - Bangalore',
    trainNumber: '12027',
    departureTime: '06:00',
    arrivalTime: '11:30',
    totalCabins: 12,
    seatsPerCabin: 78
  },
  {
    trainName: 'Tejas Express',
    route: 'Mumbai - Goa',
    trainNumber: '10103',
    departureTime: '05:00',
    arrivalTime: '13:45',
    totalCabins: 13,
    seatsPerCabin: 78
  }
];

// You can add more seed data for other collections here if needed
export const sampleGroups = [
  // Add sample groups if you want to seed them
];

export const sampleUsers = [
  // Add sample users if you want to seed them (optional)
];
