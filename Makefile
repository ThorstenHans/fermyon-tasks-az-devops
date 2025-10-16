.PHONY: build build_spin_tasks build_fermyon_cloud_tasks build_fermyon_wasm_functions_tasks

build: build_spin_tasks build_fermyon_cloud_tasks build_fermyon_wasm_functions_tasks
	@echo "Created all VSIX packages"

build_spin_tasks:
	@echo "Building Spin tasks ..."
	@cd spin && cd spin-tool && npm install && npm run build && npm prune --production && \
	cd .. && cd spin-build && npm install && npm run build && npm prune --production && \
	cd .. && cd spin-command && npm install && npm run build && npm prune --production && \
	cd .. && cd spin-install-plugin && npm install && npm run build && npm prune --production && \
	cd .. && cd spin-version && npm install && npm run build && npm prune --production && cd .. && cd ..
	@cd spin && tfx extension create --manifest-globs spin-tasks.json --output-path ../dist

build_fermyon_cloud_tasks:
	@echo "Building Fermyon Cloud tasks ..."
	@cd fermyon-cloud && cd spin-cloud-deploy && npm install && npm run build && npm prune --production && cd .. && cd ..
	@cd fermyon-cloud && tfx extension create --manifest-globs fermyon-cloud-tasks.json --output-path ../dist

build_fermyon_wasm_functions_tasks:
	@echo "Building Fermyon Wasm Functions tasks ..."
	@cd fermyon-wasm-functions && \
	cd spin-aka-login && npm install && npm run build && npm prune --production && cd .. && \
	cd spin-aka-get-app-id && npm install && npm run build && npm prune --production && cd .. && \
	cd spin-aka-deploy && npm install && npm run build && npm prune --production && cd .. && cd ..
	@cd fermyon-wasm-functions && tfx extension create --manifest-globs fermyon-wasm-functions-tasks.json --output-path ../dist
 