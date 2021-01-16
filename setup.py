from setuptools import find_packages, setup

with open("README.md") as f:
    long_description = f.read()


setup(
    name="SaveTheSpice",
    version="0.1.0",
    description="Recipe saver.",
    long_description=long_description,
    long_description_content_type="text/markdown",
    author="Tim Coutinho",
    package_dir={"": "savethespice"},
    packages=find_packages(where="savethespice"),
    python_requires=">=3.8",
    classifiers=[
        "Development Status :: 4 - Beta",
        "Framework :: AWS CDK",
        "Intended Audience :: Developers",
        "License :: OSI Approved :: MIT License",
        "Programming Language :: JavaScript",
        "Programming Language :: Python :: 3 :: Only",
        "Programming Language :: Python :: 3.8",
        "Programming Language :: Python :: 3.9",
        "Topic :: Software Development :: Code Generators",
        "Topic :: Utilities",
        "Typing :: Typed",
    ],
)
