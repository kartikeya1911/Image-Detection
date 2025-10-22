# Contributing to Falcon Detection

First off, thank you for considering contributing to Falcon Detection! 🎉

## 🌟 How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check existing issues to avoid duplicates. When creating a bug report, include:

- **Clear title and description**
- **Steps to reproduce** the issue
- **Expected vs actual behavior**
- **Screenshots** if applicable
- **Environment details** (OS, Python version, Node version, etc.)
- **Error logs** from console/terminal

**Bug Report Template:**
```markdown
**Describe the bug**
A clear description of what the bug is.

**To Reproduce**
Steps to reproduce:
1. Go to '...'
2. Click on '...'
3. See error

**Expected behavior**
What you expected to happen.

**Screenshots**
If applicable, add screenshots.

**Environment:**
- OS: [e.g., Windows 11]
- Python Version: [e.g., 3.10.5]
- Node Version: [e.g., 18.16.0]
- Browser: [e.g., Chrome 118]

**Additional context**
Any other relevant information.
```

### Suggesting Enhancements

Enhancement suggestions are welcome! Please include:

- **Use case description** - Why is this enhancement needed?
- **Proposed solution** - How should it work?
- **Alternatives considered** - Other approaches you've thought about
- **Additional context** - Mockups, examples, etc.

### Pull Requests

1. **Fork the repository** and create your branch from `main`
2. **Follow the coding style** of the project
3. **Test your changes** thoroughly
4. **Update documentation** if needed
5. **Write clear commit messages**
6. **Submit your PR** with a clear description

## 🔧 Development Setup

### Prerequisites
- Python 3.8+
- Node.js 16+
- Git

### Setup Steps

```bash
# Clone your fork
git clone https://github.com/your-username/falcon-detection.git
cd falcon-detection

# Create a virtual environment (Python)
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install backend dependencies
cd backend
pip install -r requirements.txt

# Install frontend dependencies
cd ../frontend
npm install
```

## 📝 Coding Standards

### Python (Backend)

- Follow **PEP 8** style guide
- Use **type hints** where appropriate
- Write **docstrings** for functions and classes
- Keep functions focused and concise
- Use meaningful variable names

**Example:**
```python
def detect_objects(image: np.ndarray, confidence: float = 0.5) -> List[Detection]:
    """
    Detect objects in the given image.
    
    Args:
        image: Input image as numpy array
        confidence: Minimum confidence threshold (0.0-1.0)
    
    Returns:
        List of Detection objects
    """
    # Implementation here
    pass
```

### JavaScript/React (Frontend)

- Follow **ESLint** rules (already configured)
- Use **functional components** with hooks
- Write **clear component names**
- Keep components focused (single responsibility)
- Add **PropTypes** or TypeScript types

**Example:**
```javascript
/**
 * DetectionCard component displays a single detection result
 * @param {Object} props - Component props
 * @param {Object} props.detection - Detection object
 * @param {Function} props.onClick - Click handler
 */
const DetectionCard = ({ detection, onClick }) => {
  // Component implementation
};
```

### Git Commit Messages

Use clear, descriptive commit messages:

```
feat: add video file upload detection
fix: resolve webcam permission issue on Safari
docs: update installation instructions
style: format code with prettier
refactor: simplify detection pipeline
test: add unit tests for API endpoints
chore: update dependencies
```

**Format:**
```
<type>: <subject>

<body>

<footer>
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting)
- `refactor`: Code refactoring
- `test`: Adding tests
- `chore`: Maintenance tasks

## 🧪 Testing

### Backend Tests
```bash
cd backend
pytest tests/
```

### Frontend Tests
```bash
cd frontend
npm test
```

### Manual Testing
- Test on multiple browsers (Chrome, Firefox, Safari, Edge)
- Test both upload and webcam modes
- Verify API endpoints with http://localhost:8000/docs
- Check console for errors

## 📚 Documentation

When adding new features:

1. **Update README.md** with new instructions
2. **Add docstrings/comments** in code
3. **Update API documentation** if adding endpoints
4. **Create examples** if applicable

## 🎨 Design Guidelines

- Maintain consistent color scheme
- Ensure responsive design (mobile/tablet/desktop)
- Follow accessibility standards (WCAG)
- Use existing UI components when possible
- Test on different screen sizes

## 🔍 Code Review Process

1. PRs require at least one approval
2. All tests must pass
3. Code must follow style guidelines
4. Documentation must be updated
5. No merge conflicts

## 📧 Communication

- **GitHub Issues** - For bugs and feature requests
- **Pull Requests** - For code contributions
- **Discussions** - For questions and ideas

## 🎯 Priority Areas

We especially welcome contributions in:

- 🐛 **Bug fixes** - Always appreciated!
- 📱 **Mobile responsiveness** - Improve mobile experience
- 🌍 **Internationalization** - Add language support
- ⚡ **Performance** - Optimize detection speed
- 🧪 **Testing** - Increase test coverage
- 📝 **Documentation** - Improve clarity
- 🎨 **UI/UX** - Enhance user experience

## ❓ Questions?

Don't hesitate to ask questions! You can:
- Open an issue with the `question` label
- Start a discussion
- Reach out to maintainers

## 🏆 Recognition

Contributors will be:
- Added to the contributors list
- Mentioned in release notes
- Appreciated in our hearts! ❤️

## 📜 Code of Conduct

Be respectful, inclusive, and professional. We're all here to learn and build something amazing together!

---

**Thank you for contributing to Falcon Detection! 🚀**

<div align="center">
  <img src="https://img.shields.io/badge/PRs-welcome-brightgreen.svg" alt="PRs Welcome"/>
</div>
