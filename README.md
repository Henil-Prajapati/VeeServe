Welcome to VeeServe, a robust service provider management system inspired by platforms like UrbanClap. Our system is designed to streamline the process of connecting customers with high-quality services, backed by a dedicated team of in-house service professionals.

Images

Customer

Home Page image

Login Page image

Cart Page image

Admin

Login Page image

Home Page image

Service Agent

Home Page image

Overview:

VeeServe offers a full range of services directly to customers by managing a team of professional service providers. Unlike marketplaces, we ensure consistent quality and reliability by employing service providers as part of our team. Our unique algorithm automates the assignment of service providers to jobs based on availability, ensuring a smooth operation that scales with demand.

Features:

Automated Assignment Algorithm: Assignments are made by an intelligent system that considers availability, service type, and scheduling to match service providers with customer needs.

Customer Feedback System: A built-in feedback mechanism allows for continuous improvement and customer engagement.

Robust Scheduling: Customers can book services according to their convenience, with the system managing service provider time slots effectively.

Tech Stack:

Backend: Node.js with Express framework, providing a scalable and flexible server structure.

Database: MongoDB, offering a powerful document database that handles diverse data types and is designed for scalability.

Frontend: EJS (Embedded JavaScript templating), allowing for fast server-side rendering of HTML with embedded JavaScript.

Version Control: Git, with hosting on GitHub for collaborative development and issue tracking.

Getting Started:

To get started with VeeServe on your local machine, follow these steps:

Clone the Repository

git clone https://github.com/Megh-Shah-2901/VeeServe.git

cd VeeServe

Install Dependencies

For the backend (root directory):

cd admin_module npm install

cd customer_module npm install

cd serviceAgent_module npm install

Database Configuration

Replace the MongoDB connection string with your own in the server files. If you're using a service like MongoDB Atlas, ensure that your IP is whitelisted.

Start the Server

Customer Side Solution

node app.js

Admin Side Solution

node admin_app.js

Service Provide Side Solution

node SA_app.js

For development, you may want to run:

npm run dev

Usage:

The system is accessed through a web interface where customers can browse services and make bookings. For service providers, there is a dashboard for managing their schedules and receiving assignment notifications.

Contribution

Professionals willing to contribute can check the issues tab for reported bugs and feature requests. Please ensure to follow the code of conduct and submit pull requests for review.

License

VeeServe is licensed under the MIT License. See the LICENSE file for more details.

Acknowledgements

Node.js community for continuous support and contributions.

MongoDB documentation for providing comprehensive guides.

#opensource #nodejs #expressjs #ecommerce #mern #serviceindusty
