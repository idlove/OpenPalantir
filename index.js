var vkontakte = require('vkontakte');
var request = require('request');

var vkObject = {};
var activeUsers = [];

function getToken(login,password,callback){
    var apiPage = request('https://oauth.vk.com/token?grant_type=password&client_id=2274003&client_secret=hHbZxrka2uZ6jB1inYsH&username='+login+'&password='+password,function(err,response,body){
        if (!err && response.statusCode == 200) {
            var apiJson = JSON.parse(body);
            if (apiJson.access_token != undefined) {
                callback(apiJson.access_token);
            } else {
                callback('');
            }
        }
    });
}


function apiTimerDelegator(delegate){
    setTimeout(function(){
        delegate();
    },200);
}


function initVkObject(token,callback){
    var vk = vkontakte(token);
    callback(vk);
}

function getEducation(uid,callback){
    var friendsFaculty = {};
    vkObject('friends.get',{user_id: uid,fields : 'education'},function(err,friends){
        friends.forEach(function(friend){
            if(friend.university!=undefined && friend.university != ''){
                var normalizedName = friend.university_name.toString().trim();
                if(friendsFaculty[normalizedName]!=undefined){
                    friendsFaculty[normalizedName]+=1;
                }else{
                    friendsFaculty[normalizedName] = 1;
                }
            }
        });

        var facultyObject = {};
        facultyObject.name = "";
        facultyObject.count = 0;

        for(faculty in friendsFaculty){
            if(faculty!=facultyObject.name && friendsFaculty[faculty]>facultyObject.count){
                facultyObject.name = faculty;
                facultyObject.count = friendsFaculty[faculty];
            }
        }

        callback(facultyObject);

    });
}


function getYearByEducation(education,uid,callback){
    var yearList = {};
    vkObject('friends.get',{uid : uid, fields : 'bdate,education'},function(err,friends){
        friends.forEach(function(friend){
            if(friend.bdate!=undefined && friend.university_name!=undefined){
                var parsedDate = friend.bdate.toString();
                parsedDate = parsedDate.split('.');
                if(parsedDate.length >=3){
                    var year = parsedDate[2];
                    var friendEducation = friend.university_name.toString();
                    friendEducation = friendEducation.trim();
                    if(friendEducation == education){

                        if(yearList[year.toString()]!=undefined){
                            yearList[year.toString()]+=1;
                        }else{
                            yearList[year.toString()] = 1;
                        }
                    }
                }

            }
        });

        var yearObject = {};
        yearObject.year = '';
        yearObject.count = 0;

        for(var year in yearList){
            if(yearList[year]>yearObject.count && year!=yearObject.year){
                yearObject.year = year;
                yearObject.count = yearList[year];
            }
        }

        callback(yearObject);
    });
}

getToken('','',function(token){
    if(token!=''){
        initVkObject(token,function(vk){
            vkObject = vk;
            getEducation('39243691',function(education){
                console.log(education.name);
                getYearByEducation(education.name,'39243691',function(year){
                    console.log(year.year);
                });
            });
        })
    }else{
        console.error('Empty token!');
    }
});
