var app = angular.module("myApp", []);

app.controller("myCtrl", function ($scope, $http, $interval,$timeout,$window) {
  // Mode
  $scope.live = 'local';  // bpk , phet, local

  // API URL
  if($scope.live=='bpk'){
      $scope.server_api_ip = "192.168.50.2";
      $scope.rootPart = "rfid/api";
      $scope.suffix = "";
	  }  

  if($scope.live=='phet'){
      $scope.server_api_ip = "192.168.20.109";
      $scope.rootPart = "rfid/api";
      $scope.suffix = "";
	  }  

    if($scope.live=='fome'){
      $scope.server_api_ip = "192.168.20.187";
      $scope.rootPart = "rfid/api";
      $scope.suffix = "";
    }  
    
  if($scope.live=='local'){
      // For Test
		  $scope.server_api_ip = "localhost:5500";
		  $scope.rootPart = "api";
		  $scope.suffix = ".json";
	  }

  $scope.serverPath = "http://" + $scope.server_api_ip + "/"+$scope.rootPart+"/";

  // Count Number
  $scope.apiurl = $scope.serverPath + "Modules"+$scope.suffix;

  $scope.url_skip = $scope.serverPath + "skip"+$scope.suffix;

  $scope.api_complete = $scope.serverPath + "completed"+$scope.suffix;

  // Online / Offline
  $scope.url_status = $scope.serverPath + "server"+$scope.suffix;
  $scope.url_sniff = $scope.serverPath + "status"+$scope.suffix;

  // NG List
  $scope.url_ng = $scope.serverPath + "Ngs"+$scope.suffix;

  // Remain List
  $scope.url_remain = $scope.serverPath + "Remains"+$scope.suffix;

  $scope.rv_modules = function(){
    location = $scope.apiurl;
  }; 

  // System Configulation
  // Start/Stop Process
  $scope.interv = 1;
  $scope.system_name = "RFID GATE";
  $scope.system_subject = "MODULE";
  $scope.startInterval = 3000;
  $scope.interval = 5000;

  $scope.passunlock = "";
  $scope.message=0;
  $scope.messages='';
  $scope.nstatus = 'bg-secondary';
  $scope.nfa = '';
  $scope.mccolor ='warning';
  $scope.skipcode = '555';

  // นาฬิกา
  $interval(function () {
    $scope.today = new Date();
  }, 1000);

  $scope.NotifySuccess = function(text){
    $scope.nstatus = 'bg-success text-dark';
    $scope.nfa = 'fa-retweet ';
    $scope.message = 1;
    $scope.messages = text;
    $timeout(function(){
      $scope.message = 0;
      $scope.messages = '';
    }, 5000);
  }

  $scope.NotifyWarning = function(text){
    $scope.nstatus = 'bg-warning text-dark';
    $scope.nfa = 'fa-retweet ';
    $scope.message = 1;
    $scope.messages = text;
    $timeout(function(){
      $scope.message = 0;
      $scope.messages = '';
    }, 5000);
  }

  $scope.NotifyDanger = function(text){
    $scope.nstatus = 'bg-danger text-dark';
    $scope.nfa = 'fa-retweet ';
    $scope.message = 1;
    $scope.messages = text;
    $timeout(function(){
      $scope.message = 0;
      $scope.messages = '';
    }, 5000);
  }

$scope.mcc = 0;

$scope.skipcode = "";

  $scope.playAudioYes = function() {
    var audio = document.getElementById('AudioYes');
    try { audio.play(); } catch(e){ }
};

$scope.playAudioNo = function() {
    var audio = document.getElementById('AudioNo');
    try { audio.play(); } catch(e){ }
};

$scope.playAudioComplete = function() {
    var audio = document.getElementById('AudioComplete');
    try { audio.play(); } catch(e){ }
};

  // ดึงข้อมูลระบบ
  $interval(function () {
    $http.get($scope.apiurl).then(function (response) {
      $scope.rfid_tags = response.data;
      if (response.statusText == "OK") {
        //console.log($scope.rfid_tags);
        $scope.module_code = $scope.rfid_tags.ModuleNo;
        $scope.tag_total = $scope.rfid_tags.TotalQty;
        $scope.tag_read = $scope.rfid_tags.ReadQty;
        $scope.tag_skipqty = $scope.rfid_tags.SkipQty;        
        $scope.tag_remain = $scope.rfid_tags.RemainQty;
        $scope.tag_ng = $scope.rfid_tags.NgQty;
        $scope.tag_skip = $scope.rfid_tags.Skip;

        $scope.direct_date = $scope.rfid_tags.Ddate;
        $scope.line = $scope.rfid_tags.Line;
        $scope.seq = $scope.rfid_tags.Seq;
        $scope.ModDest = $scope.rfid_tags.ModDest;
        $scope.LotMd = $scope.rfid_tags.LotMd;
        $scope.CaseNo = $scope.rfid_tags.CaseNo;
    

        

        // Tags NG
        if ($scope.tag_ng > 0) {
          $http.get($scope.url_ng).then(function (response) {
            $scope.tags_ngs = response.data;
            $scope.playAudioNo();
          });
        }

        // Module Complete
        if (($scope.tag_read + $scope.skip_number)==$scope.tag_total && $scope.tag_remain == 0 && $scope.tag_read >0 && $scope.tag_ng ==0) {

         // if($scope.mcc!=$scope.module_code){

            var data = {ModuleNo:$scope.module_code};
          $http.post($scope.api_complete,data).then(function (response) {
            var ups = response.data;
            if(ups.upStatus==1){
              $scope.NotifySuccess('Module : '+$scope.module_code+' is complete.');
              $scope.playAudioComplete();
            }else if(ups.upStatus==2){
              /*
              $scope.nstatus = 'bg-warning text-dark';
              $scope.nfa = 'fa-bullhorn ';
              $scope.Notify('Module : '+$scope.module_code+' is Exist.');
              */
              
            }else if(ups.upStatus==3){
              $scope.NotifyDanger('Database Server Connection Failed.');
            }

          });

          $scope.mcc = $scope.module_code;
          $scope.mccolor ='success';
          //}
        }

      }
    });


  }, $scope.startInterval);

  // ดึงข้อมูล รายการค้าง
  $interval(function () {
    $http.get($scope.url_remain).then(function (response) {
      $scope.rfid_remains = response.data;
      if (response.statusText == "OK") {
        if ($scope.rfid_remains.length > 0) {
          //console.log($scope.rfid_remains.length);
          $scope.playAudioYes();
        }
      }
    });

	    $http.get($scope.url_status).then(function (response) {

        $scope.api_status = response.data['Status'];
        $scope.server_status = response.status;

        // 200 online, 403, 404 Offline
    });

    $http.get($scope.url_sniff).then(function (response) {
      $scope.sniff_status = response.data['Status'];
  });


  }, $scope.startInterval);

  // ปลดล็อกทั้งหมด
  $scope.unlockAll = function (data) {
    if (data != "") {
      $scope.NotifySuccess('Clear Data...');
      var size = $scope.tags_ngs.length;
      for (i = 0; i < size; i++) {
        var item = $scope.tags_ngs[i];
        var delurl = $scope.apiurl + "/" + item.LabelNo + "?pwd=" + data;
        $http.delete(delurl).then(function (response) {
          console.log(response);
          debugger;
        });
      }
    }
  };

  // ปลดล็อก เฉพาะรายการ
  $scope.unlockSingle = function (LabelNo,pwd) {
        var delurl = $scope.apiurl + "/" + LabelNo + "?pwd=" + pwd;
        $http.delete(delurl).then(function (response) {
          //console.log(response);
          if (response.statusText == "OK") {
            $scope.NotifySuccess('Delete '+LabelNo+' is success.');
          }else{
            $scope.NotifyDanger('Canot Delete '+LabelNo+'.');
          }
        });

  };

  /*
  $window.onload = function() {
    $scope.nstatus = 'bg-success';
    $scope.nfa = 'fa-gear fa-spin';
    $scope.Notify(' Load...');
  };
*/

/*
  // แจ้งรายการครบ และ เคีล์ยข้อมูล
  $scope.ModuleComplate = function () {
    $scope.nstatus = 'bg-success';
    $scope.Notify('Compelete...');

  };
*/


  // ข้ามไปก่อน
  $scope.ModuleSkip = function () {
    var skipcode = $scope.skipcode;

debugger;

    if(skipcode==='skip'){

 debugger;
      $http.get($scope.url_skip+"?pwd=skip").then(function (response) {
        var skipdata = response.data;

        if (skipdata.skipStatus == 1) {
            $scope.NotifySuccess('Skip Module : '+mc);
        }else{
            $scope.NotifyWarning('Please try again !');
        }
        
      });  


    } else {
       $scope.NotifyDanger('Barcode is incorrect ! ');
       debugger;
    }



  };
 


});