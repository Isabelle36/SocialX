# Post Scheduler

This is a project for scheduling posts to Instagram and Facebook using the Instagram Graph API and AWS S3.

## Getting Started

Follow these steps to set up and run the project:

---

### Prerequisites

1. **Facebook Developer Account**  
   - Create or log into your [Facebook Developer Account](https://developers.facebook.com/).
   - Set up an app in the console.

2. **Facebook Page and Instagram Professional Account**  
   - Create a **Facebook Page** or use an existing one.  
   - Convert your Instagram account to a **Professional Account** (Creator or Business).  
   - Link your Instagram account to your Facebook Page under **Settings > Linked Accounts**.

3. **Setting Up Test Users**  
   - In your Facebook Developer Console:
     ```bash
     # Steps:
     1. Add test users to your app.
     2. Include the linked Instagram account as a test user.
     ```
   - Approve the app from your Instagram account.
   - Also add these products to your App
     ![image](https://github.com/user-attachments/assets/3e1a01d4-a11e-46de-bd7e-de8deff9499d)

  
4. **Granting API Permissions**  
   - In the Graph API Explorer:
     ```bash
     # Add these permissions:
     read_insights
     pages_show_list
     business_management
     instagram_basic
     instagram_manage_comments
     instagram_manage_insights
     instagram_content_publish
     instagram_manage_messages
     pages_read_engagement
     pages_read_user_content
     pages_manage_posts
     ```

5. **Getting IDs**  
   Follow [this tutorial](https://youtu.be/iN9Y7twSz7M?si=hELPKBR082DMjRM7) to retrieve:
   - Instagram User ID
   - Facebook Page ID

6. **MongoDB Database**  
   - Set up a MongoDB database using [MongoDB Atlas](https://www.mongodb.com/) or locally.
     ```bash
     # Steps:
     1. Create a database.
     2. Obtain the connection URI.
     ```

7. **AWS S3 Bucket**  
   - Create an AWS S3 bucket for storing media files.
     ```bash
     # Obtain the following credentials:
     - AWS Access Key ID
     - AWS Secret Access Key
     ```

---

### Configuration

1. Create a `.env` file in the root of the project:
   ```bash
   # Add the following environment variables:

   NEXT_PUBLIC_APP_CLIENT_ID=your-facebook-app-client-id
   NEXT_PUBLIC_INSTAGRAM_CLIENT_SECRET=your-instagram-client-secret
   NEXT_PUBLIC_INSTAGRAM_REDIRECT_URI=your-instagram-redirect-uri
   INSTAGRAM_VERIFY_TOKEN=your-verify-token
   NEXT_PUBLIC_META_ACCESS_TOKEN=your-meta-access-token
   NEXT_PUBLIC_INSTAGRAM_PROFILE_ID=your-instagram-profile-id
   NEXT_PUBLIC_FACEBOOK_PAGE_ID=your-facebook-page-id
   NEXT_PUBLIC_AWS_REGION=your-aws-region
   NEXT_PUBLIC_AWS_ACCESS_KEY_ID=your-aws-access-key-id
   NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY=your-aws-secret-access-key
   NEXT_PUBLIC_AWS_BUCKET_NAME=your-aws-bucket-name
   MONGODB_URI=your-mongodb-uri
   NODE_ENV=your-node-environment
   JWT_SECRET=your-jwt-secret
   REFRESH_TOKEN_SECRET=your-refresh-token-secret
   ```

---

### Running the Project

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Open [http://localhost:3000](http://localhost:3000) in your browser.

---

### Troubleshooting

- **API Permissions**: Ensure all permissions are approved in the Facebook Developer Console.  
- **Environment Variables**: Double-check `.env` values.  
- **Database Connection**: Verify that your MongoDB instance is running.  
- **YouTube Guide**: Refer to [this tutorial](https://youtu.be/iN9Y7twSz7M?si=hELPKBR082DMjRM7) for further help.

---

### Learn More

To learn more about the technologies used:

- [Next.js Documentation](https://nextjs.org/docs) - Learn about features and API.
- [Facebook Graph API](https://developers.facebook.com/docs/graph-api/) - Get started with Graph API.
- [The post scheduling docs] (https://developers.facebook.com/docs/instagram-platform/instagram-graph-api/reference/ig-user/media)
