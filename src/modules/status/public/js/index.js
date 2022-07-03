angular.module('status', []).controller('statusCtrl', ['$scope', '$http', '$timeout', ($scope, $http, $timeout) => {
	$scope.modules = null
	$scope.globalStatus = 'connecting'
	$scope.serverError = null

	function fetchStatus() {
		return $http.get('/status/data').then((response) => {
			$scope.serverError = null
			$scope.modules = response.data?.modules
			parseModules($scope.modules)
			if ($scope.modules.some((mod) => mod.error)) {
				$scope.globalStatus = 'someErrors'
			} else if ($scope.modules.every((mod) => mod.disabled)) {
				$scope.globalStatus = 'allDisabled'
			} else if ($scope.modules.some((mod) => !mod.status === 'starting')) {
				$scope.globalStatus = 'starting'
			} else {
				$scope.globalStatus = 'allOk'
			}
		}).catch((err) => {
			console.error(err)
			$scope.serverError = err
		}).finally(() => {
			$timeout(fetchStatus, 5000)
		})
	}

	fetchStatus()
}])

function parseModules(modules) {
	for (const mod of modules) {
		mod.status = 'ok'
		if (mod.error) mod.status = 'error'
		else if (mod.disabled) mod.status = 'disabled'
		else if (!mod.started) mod.status = 'starting'
	}
}