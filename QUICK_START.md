# 🚀 Quick Start Guide (5 Minutes)

Get the CAD configurator running in 5 simple steps!

---

## Step 1: Install PythonOCC (REQUIRED) ⚙️

**Option A: Automated (Recommended)**

```bash
./INSTALL_NOW.sh
```

**Option B: Manual**

```bash
# Install Miniconda
brew install --cask miniconda

# Create environment
conda create -n opencascade python=3.10 -y
conda activate opencascade

# Install PythonOCC
conda install -c conda-forge pythonocc-core -y

# Test it
python python-api/test_occt.py
```

---

## Step 2: Configure Python Path 🐍

```bash
# Get your Python path
conda activate opencascade
which python

# Example output:
# /Users/yourname/miniconda3/envs/opencascade/bin/python
```

Edit `server/.env`:

```env
PYTHON_PATH=/Users/yourname/miniconda3/envs/opencascade/bin/python
```

---

## Step 3: Start Backend Server 🖥️

```bash
cd server
npm install    # First time only
npm run dev

# ✅ You should see:
# ✅ Server running on http://localhost:3001
# ✅ Prisma database connection established
# ✅ PythonOCC: Available
```

---

## Step 4: Start Frontend 🌐

```bash
# In a new terminal
cd frontend
npm install    # First time only
npm run dev

# ✅ You should see:
# ✅ Ready on http://localhost:3000
```

---

## Step 5: Generate Your First Model! 🎉

1. Open http://localhost:3000
2. Click on "Bottle" or "Box" card
3. Switch to "Configurator" tab
4. Adjust parameters (sliders)
5. Click "🚀 Generate Model"
6. Wait ~5-10 seconds
7. View 3D model!
8. Download STEP/STL files

---

## ✅ Success Checklist

- [ ] Backend running on port 3001
- [ ] Frontend running on port 3000
- [ ] PythonOCC shows "Available" in backend logs
- [ ] Product catalog loads (shows Bottle and Box)
- [ ] Parameter form displays when selecting product
- [ ] "Generate Model" creates STEP/STL files
- [ ] 3D viewer displays generated model
- [ ] Download buttons work

---

## 🐛 Troubleshooting

### "PythonOCC: Not available"

```bash
# Make sure conda environment is activated
conda activate opencascade

# Get the correct Python path
which python

# Update server/.env with this path
```

### "Database not available"

```bash
# Your DATABASE_URL in server/.env might be wrong
# Check the connection string:
# postgresql://user:password@host:port/database?sslmode=require
```

### "Failed to generate model"

```bash
# Check backend terminal for errors
# Most common: wrong PYTHON_PATH in .env
```

### Port already in use

```bash
# Backend (3001)
lsof -ti:3001 | xargs kill -9

# Frontend (3000)
lsof -ti:3000 | xargs kill -9
```

---

## 📚 Next Steps

- **Add more products**: Create new Python generators in `python-api/products/`
- **Customize UI**: Edit `frontend/app/page.tsx`
- **Add authentication**: Implement user login/signup
- **Deploy to Azure**: Follow `docker-compose.yml` setup

---

## 🆘 Still Having Issues?

**Check these resources:**
- `README.md` - Project overview and architecture
- `PROJECT_STATUS.md` - Implementation status and missing features
- Backend logs - Most errors show in terminal where you ran `npm run dev`

**Common Issues:**
1. **Port conflicts**: Kill existing processes on ports 3000/3001
2. **Python path wrong**: Get it with `conda activate opencascade && which python`
3. **Database connection**: Check `DATABASE_URL` in `server/.env`

---

**Estimated Time:** 5-10 minutes (including Conda install)

**You're all set! Enjoy generating CAD models! 🎉**

