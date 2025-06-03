#!/bin/bash
# Deployment script for Durer Timer application

# Create necessary directories
mkdir -p nginx/conf nginx/certs

# Copy nginx configuration
cp nginx.conf nginx/conf/default.conf

# Check if SSL certificates exist, if not, generate self-signed certs
if [ ! -f "nginx/certs/cert.pem" ] || [ ! -f "nginx/certs/key.pem" ]; then
    echo "Generating self-signed SSL certificates..."
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
      -keyout nginx/certs/key.pem -out nginx/certs/cert.pem \
      -subj "/C=US/ST=State/L=City/O=Organization/CN=localhost"
    echo "Self-signed certificates generated. Replace with real certificates in production."
fi

# Create .env file if it doesn't exist
if [ ! -f ".env" ]; then
    echo "Creating default .env file..."
    cat > .env << EOL
# Database configuration
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=durer_timer

# Backend configuration
DATABASE_URI=postgresql://postgres:postgres@postgres/durer_timer
SECRET_KEY=$(openssl rand -hex 32)
API_DEBUG=False
ALLOW_ORIGINS=https://your-domain.com,http://localhost

# Frontend configuration
VITE_API_URL=/api
EOL
    echo ".env file created. Update with your actual values before deployment."
fi

# Deploy with docker-compose
echo "Starting deployment with Docker Compose..."
docker-compose up -d --build

echo "Deployment completed! Your application should be running at:"
echo "https://YOUR_SERVER_IP"
echo ""
echo "To check logs:"
echo "  docker-compose logs -f"
echo ""
echo "To stop:"
echo "  docker-compose down"
