#!/bin/bash
echo "========================================="
echo " Visitor Pass Management System"
echo "========================================="
echo ""
echo "Starting backend..."
cd backend && npm run dev &
BACKEND_PID=$!
echo "Backend PID: $BACKEND_PID"
sleep 2
echo "Starting frontend..."
cd ../frontend && npm start &
FRONTEND_PID=$!
echo ""
echo "Both servers started!"
echo "Backend:  http://localhost:5000"
echo "Frontend: http://localhost:3000"
echo ""
echo "Press Ctrl+C to stop both servers."
wait
