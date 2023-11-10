.PHONY: build build_spin_tool_task build_spin_build_task build_deploy_to_fermyon_cloud_task build_spin_version_task build_spin_command_task

build: build_spin_tool_task build_spin_build_task build_deploy_to_fermyon_cloud_task build_spin_version_task build_spin_command_task
	@echo "Building vsix package"
	@tfx extension create --manifest-globs fermyon-tasks.json --output-path dist

build_spin_tool_task:
	@echo "Building Spin tool task..."
	@cd spin-tool && npm run build

build_spin_build_task:
	@echo "Building Spin build task..."
	@cd spin-build && npm run build

build_spin_version_task:
	@echo "Building Spin version task..."
	@cd spin-version && npm run build

build_spin_command_task:
	@echo "Building Spin command task..."
	@cd spin-command && npm run build
	
build_deploy_to_fermyon_cloud_task:
	@echo "Building Deploy to Fermyon Cloud task..."
	@cd deploy-to-fermyon-cloud && npm run build


