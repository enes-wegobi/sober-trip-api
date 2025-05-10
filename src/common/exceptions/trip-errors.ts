export const TripErrors = {
  INVALID_REQUEST: {
    code: 'T101',
    message:
      'Invalid request. At least one origin and one destination point is required.',
  },
  INVALID_COORDINATES: {
    code: 'T102',
    message:
      'Invalid request. Origin and destination coordinates are required.',
  },
  MAPS_API_ERROR: {
    code: 'T103',
    message: 'Error occurred while communicating with Maps API.',
  },
};
