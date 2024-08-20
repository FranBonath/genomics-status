const init_datatable = (table_name) => {
    // Setup - add a text input to each footer cell
    $('#'+table_name+' tfoot th').each(function () {
        const title = $('#'+table_name+' thead th').eq($(this).index()).text();
        $(this).html(`<input size=10 type="text" placeholder="Search ${title}" />`);
    });

    const table = $('#'+table_name).DataTable({
        paging: false,
        info: false,
        order: [[0, 'desc']]
    });

    // Add the bootstrap classes to the search thingy
    $('div.dataTables_filter input').addClass('form-control search search-query');
    $('#'+table_name+'_filter').addClass('form-inline');
    $('#'+table_name+'_filter input').addClass('input-sm');
    $('#'+table_name+'_filter').appendTo('#'+table_name+'_filter_col');
    $('#'+table_name+'_filter label ').html($('#'+table_name+'_filter input'));
    $('#'+table_name+'_filter input').attr("placeholder", "Search..");

    // Apply the search
    table.columns().every(function () {
        const that = this;
        $('input', this.footer()).on('keyup change', function () {
        that
            .search(this.value)
            .draw();
        });
    });
};

const init_datepickers = () => {
    $('#datepick1').datepicker({ orientation: 'left top' });
    $('#datepick2').datepicker({ orientation: 'left top' });
};

const init_submit_button = () => {
    $('#submit_interval').click((e) => {
        e.preventDefault();
        let m_d_y;
        let first_date;
        let second_date;
        let dp = $('#inp_date_1').val();

        if (dp !== '') {
            m_d_y = dp.split('/');
            first_date = new Date(m_d_y[2], m_d_y[0] - 1, m_d_y[1]);
        } else {
            first_date = new Date(2016, 01, 01);
        }

        dp = $('#inp_date_2').val();

        if (dp !== '') {
            m_d_y = dp.split('/');
            second_date = new Date(m_d_y[2], m_d_y[0] - 1, m_d_y[1]);
        } else {
            second_date = new Date();
        }
        load_table("instrument_logs_table",`${Math.round(first_date.getTime() / 1000)}-${Math.round(second_date.getTime() / 1000)}`);
        });
};

$(document).ready(function() {
    // Load the data
    init_datatable('biomek_errs_table');
    init_datepickers();
    init_submit_button();
    load_table("instrument_logs_table");
});


function load_table(tablename, searchstring="") {
    $('#'+tablename+'_body').html('<tr><td colspan="10" class="text-muted"><span class="fa fa-sync fa-spin"></span> <em>Loading..</em></td></tr>');
    //searchstring = '1451602800-1483225200'
    let inst = 'bravo';
    if (tablename == 'biomek_errs_table')
        inst = 'biomek';
    return $.getJSON('/api/v1/instrument_logs/'+inst+'/'+searchstring, function(data) {
      $('#'+tablename+'_body').empty();
      $.each(data, function(key, value) {
        let tbl_row = $('<tr>');
        if(!($.isEmptyObject(value))){
          timestamp = new Date(value['timestamp']);
          tbl_row.append($('<td>').html(timestamp.toLocaleDateString('sv-SE')+' ' + timestamp.toLocaleTimeString(timestamp)));
          tbl_row.append($('<td>').html(value['instrument_name']));
          tbl_row.append($('<td>').html(value['message'])); 
          $('#'+tablename+'_body').append(tbl_row);
        }
      });
      if ( ! $.fn.dataTable.isDataTable('#'+tablename)){
        init_datatable(tablename);
      }
    });
  }