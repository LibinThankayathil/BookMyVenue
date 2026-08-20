import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'BookMyVenue - Venue Service API',
      version: '1.0.0',
      description: 'API documentation for the Venue Service microservice.',
    },
    servers: [
      {
        url: 'http://localhost:5001',
        description: 'Development server',
      },
    ],
  },
  apis: ['./src/routes/*.ts', './src/controllers/*.ts', './src/docs/*.yaml'], // Path to the API docs
};

export const swaggerSpec = swaggerJsdoc(options);
