Mast.registerComponent('ImportUserComponent', {
    
    template: '.import-user-template',
    outlet: '#content',
    
    events: {
        'click .setting-save-button': 'importUser',
    },
    
    model: {
        superadmin: false,
    },

    init: function(){//taken from addusercomponent

        var lock =  { id : '12' };
        $('.searchbar').hide();
        $('.upload-file').hide();

        if(Mast.Session.Account.isSuperAdmin){
            this.model.set('superadmin', true);
        }
    },

    afterRender: function(){

        var lock =  { id : '12' };

        Mast.Socket.request('/account/listWorkgroup', lock, function(res, err){
            if(res){
                var options = "<option value=''>Select Workgroup</option>";             $.each( res, function( i, val ) {
                    options = options + '<option value="'+ val.id +'">' + val.name + '</option>'; 
                });
                $('#list_workgroup').html(options);
            }
        });

        Mast.Socket.request('/subscription/getSubscription', null, function(res, err){
            if(res){
                var options;
                $.each( res, function( i, val ) {
                    if(val.is_default === 1){
                        options = options + '<option selected value="'+ val.id +'">' + val.features + '</option>'; 
                    }else{
                        options = options + '<option value="'+ val.id +'">' + val.features + '</option>'; 
                    }
                });
                if(options){
                    $('#subscription-drop').html(options);
                    $('.add-subs-cont').remove();
                }else{
                    $('.add-subs-cont').show();
                    $('.ent-form-cont').remove();       
                }
            }
        });
    },
    
    collection: 'Account',

    /*importUser2: function (e) {
        // console.log(this.$('input[name="file"]').val());
        // console.log(this.$('input[name="file"]')[0]);
        // console.log(this.$('input[name="file"]')[0].files[0]);
        var ext = $('input[name="file"]').val().split(".").pop().toLowerCase();

        if($.inArray(ext, ["csv"]) == -1) {
            alert("Please upload only CSV files.");
            return false;
        }
                
        var reader = new FileReader();
        reader.readAsText(this.$('input[name="file"]')[0].files[0]);
        reader.onload = function(e) {
            var csvval=e.target.result.split("\n");
            // var csvvalue=csvval[0].split(",");
            var inputrad="";
            for(var i=0;i<csvval.length;i++)
            {
                var temp=csvvalue[i];
                var inputrad=inputrad+" "+temp;
            }
        }
    },*/

    importUser: function () {

        var self = this;
        var userData = this.getFormData();

        file = $('input[name="file"]')[0];
        console.log(file);
        console.log(file.value);
        console.log('file.typefile.typefile.typefile.typefile.type');

        var ext = $('input[name="file"]').val().split(".").pop().toLowerCase();

        if($.inArray(ext, ["csv"]) == -1) {
            alert("Please upload only CSV files.");
            return false;
        }

        // if (self.validateForm()) {

            Mast.Socket.request('/profile/checkUsersLimit', null, function (re, er) {

                if (re.not_subscriber && Mast.Session.Account.isSuperAdmin != true) {
                    alert('You have not subscribed any plan yet!');
                    Mast.navigate('#account/subscription');
                } else {

                    if (re.error) {

                        self.clearForm();
                        $("#msgid").html("");
                        $(".user-file").css({"border": "1px solid LightGray"});
                        alert('You have reaced maximum limit of creating users');

                    } else {
                        // { name:file.name, type:file.type, size:file.size, binary: img, pic_type : 'profile' }
                        /*Mast.Socket.request('/account/readCSVFile', { name:file.name, type:file.type, size:file.size, filepath: $('input[name="file"]')[0].files[0] }, function (reso, er) {
                            if (reso) {
                                self.clearForm();
                                $("#msgid").html("");
                                $(".user-file").css({"border": "1px solid LightGray"});
                                alert('Successfully Saved!');
                                Mast.navigate('#listusers');
                            }
                        });*/
                        var reader = new FileReader();
                        reader.readAsText(this.$('input[name="file"]')[0].files[0]);
                        reader.onload = function(e) {

                            var users = new Array();
                            var csvval=e.target.result.split("\n");
                            for(var i=1;i<csvval.length;i++)
                            {
                                if(csvval[i] != ''){
                                    var csvvalue=csvval[i].split(/(?:,|;)+/);
                                    var inputrad="";
                                    // console.log(csvvalue);
                                    // for(var j=0;j<csvvalue.length;j++)
                                    // {
                                    //     var temp=csvvalue[j];
                                    //     var inputrad=inputrad+" "+temp;
                                    // }
                                    // console.log(inputrad);

                                    // users.push([FirstName, Last Name, Email, Password, Title ]);
                                    users.push([csvvalue[0],csvvalue[1],csvvalue[2],csvvalue[3],csvvalue[4]]);
                                }
                            }
                            console.log(users);

                            Mast.Socket.request('/account/readCSVFile', { 'users': users, 'workgroup': $('select[name="workgroup"]').val(), 'role': $('select[name="role"]').val()  }, function (reso, er) {
                                self.clearForm();
                                $(".csv-user-import-status").html('');
                                console.log('Status: ');
                                console.log(reso);
                                // console.log(er);
                                $("#msgid").html("");
                                $(".user-file").css({"border": "1px solid LightGray"});
                                if(er){
                                    // alert('Some Error Occurred.');
                                    $(".csv-user-import-status").append(er);
                                }
                                if (reso) {
                                    import_status_html = 'CSV Import Status: <br>';
                                    success_emails = new Array();
                                    if(typeof reso.body != 'undefined' ){
                                        for(i=0;i < reso.body.length; i++){
                                            // console.log('users'+[i]);
                                            // console.log(users[i]);
                                            // console.log(reso.body[i]);
                                            if(typeof reso.body[i].body.email != 'undefined'){
                                                success_emails.push(reso.body[i].body.email);
                                                import_status_html += '<strong>'+reso.body[i].body.email+ '</strong>' + ' ('+reso.body[i].body.name+') registered successfully.<br>';
                                            }
                                        }
                                    }
                                    if(success_emails.length != users.length){
                                        for(i=0;i < users.length; i++){
                                            if($.inArray(users[i][2], success_emails) == -1) {
                                                import_status_html += '<strong>'+ users[i][2]+'</strong>' + ': registration failed.<br>';
                                            }
                                        }
                                    }
                                    console.log('import_status_html');
                                    console.log(import_status_html);
                                    $(".csv-user-import-status").html(import_status_html);
                                    // alert('Successfully Saved!');
                                    Mast.navigate('#listusers');
                                }
                            });
                        };
                        reader.onerror = function (e) {
                            alert("Upload CSV could not be read.");
                            return false;
                        };
                    }
                }
            });
        // }
    },

    getFormData: function () {
        var file = this.$('input[name="file"]').val();
        return {
            filepath: this.$('input[name="file"]').val()
        };
    },

    clearForm: function () {
        this.$('input[name="file"]').val('');
    },

    /*validateForm: function () {
        this.clearFormCSS();
        if (this.$('input[name="file"]').val() === '') {
            $("#msgid").html("<span class='error_span'> Please Select file. </span>");
            $(".user-file").css({"border": "1px solid red"});
            return false;
        } else {

            var file = this.$('input[name="file"]').val();
            var filename = file.split('\\').pop();
            var ext = filename.split('.').pop();
            if (ext != 'csv') {
                $("#msgid").hide();
                alert("Please upload only CSV files.");
                return false;
            }
        }
        return true;
    },*/

    clearFormCSS: function () {
//        alert('called');
//        $(".file").removeClass();
//        $(".error_span").removeClass();
//        $(".user-file").removeClass();
    },
});
