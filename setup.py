from setuptools import setup, find_packages

with open("requirements.txt") as f:
	install_requires = f.read().strip().split("\n")

# get version from __version__ variable in momsfab/__init__.py
from momsfab import __version__ as version

setup(
	name="momsfab",
	version=version,
	description="Momsfab",
	author="Momscode Technologies",
	author_email="info@momscode.in",
	packages=find_packages(),
	zip_safe=False,
	include_package_data=True,
	install_requires=install_requires
)
