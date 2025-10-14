.PHONY: build build_spin_tool_task build_spin_build_task build_deploy_to_fermyon_cloud_task build_spin_version_task build_spin_command_task build_spin_install_plugin_task build_spin_aka_deploy_task build_spin_aka_login_task build_spin_aka_get_app_id_task

build: build_spin_tool_task build_spin_build_task build_deploy_to_fermyon_cloud_task build_spin_version_task build_spin_command_task build_spin_install_plugin_task build_spin_aka_deploy_task build_spin_aka_login_task build_spin_aka_get_app_id_task
	@echo "Building vsix package"
	@tfx extension create --manifest-globs fermyon-tasks.json --output-path dist

build_spin_tool_task:
	@echo "Building Spin tool task..."
	@cd spin-tool && npm install && npm run build && npm prune --production

build_spin_build_task:
	@echo "Building Spin build task..."
	@cd spin-build && npm install && npm run build && npm prune --production

build_spin_version_task:
	@echo "Building Spin version task..."
	@cd spin-version && npm install && npm run build && npm prune --production

build_spin_command_task:
	@echo "Building Spin command task..."
	@cd spin-command && npm install && npm run build && npm prune --production

build_spin_install_plugin_task:
	@echo "Building Spin Install Plugin task..."
	@cd spin-install-plugin && npm install && npm run build && npm prune --production
	
build_deploy_to_fermyon_cloud_task:
	@echo "Building Deploy to Fermyon Cloud task..."
	@cd deploy-to-fermyon-cloud && npm install && npm run build && npm prune --production

build_spin_aka_login_task:
	@echo "Building Login to Fermyon Wasm Functions task..."
	@cd spin-aka-login && npm install && npm run build && npm prune --production

build_spin_aka_deploy_task:
	@echo "Building Deploy to Fermyon Wasm Functions task..."
	@cd spin-aka-deploy && npm install && npm run build && npm prune --production

build_spin_aka_get_app_id_task:
	@echo "Building Get App Id from Fermyon Wasm Functions task..."
	@cd spin-aka-get-app-id && npm install && npm run build && npm prune --production



