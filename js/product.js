/**
 * Created by zd on 2014/5/11 0011.
 */
//��ͼ-------------start
(function (win) {
    var map,
        dPos,
        oPos,
        _flag = 1,//1-bus search,2-car search
        _initialize = function (cfg) {
            var _cfg = {};
            _cfg.x = cfg.x || 0;
            _cfg.y = cfg.y || 0;
            _cfg.tit = cfg.tit|| "";
            _cfg.z = cfg.zoom || 15;
            var myLatlng = new sogou.maps.Point(parseFloat(_cfg.x), parseFloat(_cfg.y));
            var myOptions = {
                'zoom': _cfg.z,
                'center': myLatlng,
                'mapTypeId': sogou.maps.MapTypeId.ROADMAP
            }
            map = new sogou.maps.Map(document.getElementById("shop-map"), myOptions);
            var marker = new sogou.maps.Marker({'position': myLatlng,map: map,title:_cfg.tit});
            dPos = myLatlng;
            $('body').removeAttr('style');
        },
    /*������ѯ�ص�function */
        _busCallback = function (a){
            var option={
                'map':map,
                'busResult':a
            };
            map.clearAll();
            var bRender=new sogou.maps.BusRenderer(option);
        },
    /*������ѯ */
        _setBusLine = function (start, dest, maxDist) {
            var request={
                'map':map,        //Map
                'destination':dest,//Ŀ��λ�á�Ҫ���е�ַ�������ַ����� LatLng����Ϊ�ѹ���ͼ���ꡣ���
                'origin':start,        //ԭ���λ�á�Ҫ���е�ַ�������ַ����� LatLng����Ϊ�ѹ���ͼ���ꡣ���
                'maxDist':maxDist//���Ĳ��о��롣��ѡ
            }

            var bus = new sogou.maps.Bus();

            bus.route(request, _busCallback);
        },
    /*�ݳ���ѯ����ʾ��� */
        _setCarLine = function (start, dest, tactic) {
            var request={
                'map':map,
                'destination':dest,
                'origin':start,
                'tactic':tactic       //�ݳ����ԡ� 0�� ����̣�1 ��ʱ��� Ĭ�ϲ��� ����ѡΪ1����2 �����߸���
            }
            var nav=new sogou.maps.Driving();
            nav.route(request);
            map.clearAll();
            //���
            nav.setRenderer(new sogou.maps.DrivingRenderer());
        },
    //ѡbus��ѯ
        _busSelected = function (e) {
            var self = $(this),
                $carSelectBtn = $('#carSelectBtn'),
                $busWrap = $('#busWrap'),
                $carWrap = $('#carWrap');
            if (self.hasClass('cur')) {
                return;
            }
            _flag = 1;
            $carSelectBtn.removeClass('cur');
            self.addClass('cur');
            $busWrap.css('display','block');
            $carWrap.css('display','none');
        },
    //ѡcar��ѯ
        _carSelected = function (e) {
            var self = $(this),
                $busSelectBtn = $('#busSelectBtn'),
                $busWrap = $('#busWrap'),
                $carWrap = $('#carWrap');
            if (self.hasClass('cur')) {
                return;
            }
            _flag = 2;
            $busSelectBtn.removeClass('cur');
            self.addClass('cur');
            $carWrap.css('display','block');
            $busWrap.css('display','none');
        },
    //��ʼbus��ѯ
        _startBusSearch = function (e) {
            var $s = $('#busStart'),
                sval = $s.val();
            //console.log(sval+'  '+eval);
            if (!sval) {
                alert('��������ʼ�ص㣡');
                $s[0].focus();
                return;
            }
            _setBusLine(oPos,dPos,1000);
        },
    //��ʼcar��ѯ
        _startCarSearch = function (e) {
            var $s = $('#carStart'),
                sval = $s.val();
            //console.log(sval+'  '+eval);
            if (!sval) {
                alert('��������ʼ�ص㣡');
                $s[0].focus();
                return;
            }
            _setCarLine(oPos,dPos,2);
        },
    //��ַ�����ص�
        _geocoderCallback = function (a){
            if(_flag === 1){
                $('#busSearchBtn').removeAttr('disabled');
            }else {
                $('#carSearchBtn').removeAttr('disabled');
            }
            if(a.status == 'ok'){
                var geometry=a.data[0];
                oPos = geometry.location;
            } else {
                alert('��������ʼ��ַ����');
            }
        },
    //��ַ����
        _geocoderFunc = function (cfg) {
            if(!cfg){
                return;
            }
            if(_flag === 1){
                $('#busSearchBtn').attr('disabled',true);
            }else {
                $('#carSearchBtn').attr('disabled',true);
            }
            var geo=new sogou.maps.Geocoder();
            geo.geocode(cfg,_geocoderCallback);
        },

        _busStartPos = function (e) {
            var v, cfg;
            v = $('#busStart').val();
            if(!v){
                return;
            }
            cfg= {
                address:{
                    addr:v,
                    city:mapSetting.city
                }
            };
            _geocoderFunc(cfg);
        },
        _carStartPos = function (e) {
            var v, cfg;
            v = $('#busStart').val();
            if(!v){
                return;
            }
            cfg= {
                address:{
                    addr:v,
                    city:mapSetting.city
                }
            };
            _geocoderFunc(cfg);
        },
        _initEvent = function () {
            $('#busSelectBtn').click(_busSelected);
            $('#carSelectBtn').click(_carSelected);
            $('#busSearchBtn').click(_startBusSearch);
            $('#carSearchBtn').click(_startCarSearch);
            $('#busStart').blur(_busStartPos);
            $('#carStart').blur(_carStartPos);
        };

    win['mapFunc'] = {
        initialize : _initialize,
        initEvent : _initEvent,
        busStartPos : _busStartPos
    }

})(window);

function createCarItem(itemExample ,itemData)
{
    var $item = $(itemExample.cloneNode(true));
    $item.find(".carItem").text(itemData.name);
    $item.find(".carPrice").find('i').text(itemData.price);
    return $item;
}

function createShopItem(itemExample ,itemData)
{
    var $item = $(itemExample.cloneNode(true));
    $item.find(".shopItem").text(itemData.name);
    $item.find(".shopPhone").text(itemData.phone);
    return $item;
}

function initHistory(historyArr, carItem, shopItem)
{
    var len = historyArr.length;
    if(len === 0)
    {
        $("#browsing-record").html('<p>��ʱ�������¼</p>');
        return;
    }
    var $container = $('#browsing-record-list').empty();
    for(var i = 0; i < len; ++i)
    {
        var $item;
        if(historyArr[i].type == "car")
        {
            $item = createCarItem(carItem, historyArr[i]);
        }
        else
        {
            $item = createShopItem(shopItem, historyArr[i]);
        }
        $container.append($item);
    }
    $container.find(".deleteBtn").each(function(i, item)
    {
        $(this).on("tap", function()
        {
            $container.find('li').eq(i).remove();
            historyList.splice(i, 1);
            window.localStorage.setItem('historyList', JSON.stringify(historyList));
            if(historyList.length === 0)
            {
                $("#browsing-record").html('<p>��ʱ�������¼</p>');
            }
        });
    });
}

function initCollect(collectArr, carItem, shopItem)
{
    var len = collectArr.length;
    if(len === 0)
    {
        $("#collect-record").html('<p>��ʱ���ղؼ�¼</p>');
        return;
    }
    var $container = $('#collect-record-list').empty();
    for(var i = 0; i < len; ++i)
    {
        var $item;
        if(collectArr[i].type == "car")
        {
            $item = createCarItem(carItem, collectArr[i]);
        }
        else
        {
            $item = createShopItem(shopItem, collectArr[i]);
        }
        $container.append($item);
    }
    $container.find(".deleteBtn").each(function(i, item)
    {
        $(this).on("tap", function()
        {
            $container.find('li').eq(i).remove();
            collectList.splice(i, 1);
            window.localStorage.setItem('collectList', JSON.stringify(collectList));
            if(collectList.length === 0)
            {
                $("#collect-record").html('<p>��ʱ���ղؼ�¼</p>');
            }
        });
    });
}

/* ��ʾ������ϵ��״̬�� */
function closeLinkInfo(type) {
    if (type == 1) {
        $('#LinkInfo').hide();
        $('#openLinkInfo').show();
    } else {
        $('#LinkInfo').show();
        $('#openLinkInfo').hide();
    }
}

$(function() {

    var $collectItems = $("#collect-record-list").find('li');
    var carItem = $collectItems[0], shopItem = $collectItems[1];
    //�����ʷ���ղ�����
    if(window.localStorage)
    {
        initCollect(collectList, carItem, shopItem);
        initHistory(historyList, carItem, shopItem);
        //��հ�ť
        $('#clearBtn').on('tap', function()
        {
            if($('#collect-record-wrap').hasClass('ui-state-active'))
            {
                collectList = [];
                window.localStorage.setItem('collectList', collectList);
                $('#collect-record-list').empty();
                $("#collect-record").html('<p>��ʱ���ղؼ�¼</p>');
            }
            else
            {
                historyList = [];
                window.localStorage.setItem('historyList', historyList);
                $('#history-record-list').empty();
                $("#history-record").html('<p>��ʱ�������¼</p>');
            }
        });
    }
    else
    {
        $("#collect-record").html('<p>�����������֧���ղ�</p>');
        $("#browsing-record").html('<p>�����������֧�ֲ鿴��ʷ��¼</p>');
    }

    //�رչ����
    $('#adBanner').find('.close').on('tap', function()
    {
        $('#adBanner').hide();
    });

    //��������
    $('#nav').navigator();

    $('#nav_arrow').on('tap', function(){
        $('#nav').iScroll( 'scrollTo', 100, 0, 400, true );
    });

    //չ����ر�
    $('.readmore').on('tap', function()
    {
        $(this).toggleClass('closemore').parent().next().toggle();
    });

    //tabs�л�
    $(".history-tabs").tabs();

    //��ʷ���ղ�
    $("#history").on("tap", function()
    {
        $('.search-wrap').css('visibility', 'hidden');

        var $history_wrap = $('.history-wrap');
        if($history_wrap.css('visibility') == 'hidden')
        {
            $history_wrap.css('visibility', 'visible');
            $("#static-part").hide();
        }
        else
        {
            $history_wrap.css('visibility', 'hidden');
            $("#static-part").show();
        }
    });
    $('#closeBtn').on('tap', function()
    {
        $('.history-wrap').css('visibility', 'hidden');
        $("#static-part").show();
    });



    //������
    $("#search").on("tap", function()
    {
        $('.history-wrap').css('visibility', 'hidden');
        var $search_wrap = $('.search-wrap');
        if($search_wrap.css('visibility') == 'hidden')
        {
            $search_wrap.css('visibility', 'visible');
            $("#static-part").hide();
        }
        else
        {
            $search_wrap.css('visibility', 'hidden');
            $("#static-part").show();
        }
    });

    //�ٱ��Ի���
    $("#report-dialog").dialog({
        autoOpen:false,
        closeBtn:false,
        title:"�ٱ�",
        buttons: {
            "ȡ��": function(){
                this.close();
            },
            "ȷ��": function(){
                this.close();
            }
        }
    });

    //����Ի���
    $("#suggest-dialog").dialog({
        autoOpen:false,
        closeBtn:false,
        buttons: {
            "ȡ��": function(){
                this.close();
            },
            "ȷ��": function(){
                this.close();
            }
        }
    });

    //��Դtab��
    $('#recommend-cars').tabs();

    //��������Ի���
    $("#suggestion").on('tap', function()
    {
        $('#suggest-dialog').dialog('open');
        return false;
    });

    //�����ٱ��Ի���
    $('.report').on('tap', function()
    {
        $('#report-dialog').dialog('open');
        return false;
    });

    //���ԶԻ���
    $("#message-dialog").dialog({
        autoOpen:false,
        closeBtn:false,
        title:"����",
        buttons: {
            "ȡ��": function(){
                this.close();
            },
            "ȷ��": function(){
                this.close();
            }
        }
    });

    //�������ԶԻ���
    $('.message').on('tap', function()
    {
        $('#message-dialog').dialog('open');
        return false;
    });
    var $body = $('body');
    if(mapSetting){
        mapFunc.initialize({x:mapSetting.mapX,y:mapSetting.mapY,tit:mapSetting.title});
        mapFunc.busStartPos();
        if($body[0].style.overflow == 'hidden'){
            $body[0].style.overflow = 'auto';
        }
    }
});