
function get(api, done) {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', api);
    xhr.onreadystatechange = () => {
        if (xhr.readyState !== XMLHttpRequest.DONE) {
            return;
        }

        if (xhr.status === 200) {
            done(JSON.parse(xhr.responseText));
        } else {
            console.error('Request failed', xhr);
            done(new Error(xhr.responseText));
        }
    };
    xhr.send();
}

function Table(props) {
    return (
      <table className="table">
        <thead>
          <tr>
            <th scope="col">#</th>
            <th scope="col">Version</th>
            <th scope="col">Sessions</th>
            <th scope="col">Updated</th>
            <th scope="col">% Stmts</th>
            <th scope="col">% Branch</th>
            <th scope="col">% Funcs</th>
            <th scope="col">% Lines</th>
            <th scope="col">Reports</th>
            <th scope="col">Actions</th>
          </tr>
        </thead>
        <tbody>
          {props.rows}
        </tbody>
      </table>);
}

function TableItem(props) {
    const info = props.info;
    info.updated = info.updated.replace('T', ' ').replace('.000Z', '');
    return (
      <tr>
        <td>{info.no}</td>
        <td>
          <a target="_blank" href={`/api/version/${info.gitHash}`}>{info.version}</a>
        </td>
        <td>
          <span>{info.sessionCnt}</span><br/>
          <em className="small">{info.sizeDisplay}</em>
        </td>
        <td>{info.updated}</td>
        <CoverageValue cov={info.Stmts}/>
        <CoverageValue cov={info.Branch}/>
        <CoverageValue cov={info.Funcs}/>
        <CoverageValue cov={info.Lines}/>
        <td>
          <a target="_blank" href={`/html/${info.gitHash}`}>HTML</a><br/>
          <a target="_blank" href={`/api/coverage/${info.gitHash}`}>Text</a>
        </td>
        <td>
          <a target="_blank" title="Regenerate HTML report" href={`/api/coverage/html/${info.gitHash}`}>🔄</a>
        </td>
      </tr>
    );
}

function CoverageValue(props) {
    if (!props.cov) {
        return (<td></td>);
    }

    let diff = '';
    if (props.cov.diff > 0) {
        diff = (<span className="badge badge-pill badge-success">+{props.cov.diff}</span>);
    } else if (props.cov.diff < 0) {
        diff = (<span className="badge badge-pill badge-danger">{props.cov.diff}</span>);
    }
    return (
      <td>
        <span>{props.cov.value}</span><br/>
        <span className="small">{diff}</span>
      </td>
    );
}

function render() {
    let info = JSON.parse(localStorage.getItem('info') || '[]');
    if (!info.map) {
        info = [];
    }

    let progress = JSON.parse(localStorage.getItem('progress') || '[]');
    if (!progress.find) {
        progress = [];
    }

    const data = info.map(item => {
        const coverage = progress.find(cov => cov.gitHash === item.gitHash) || {};
        return {
            ...item,
            ...coverage
        };
    });

    const rows = data.map(item => (<TableItem info={item}/>));
    ReactDOM.render(<Table rows={rows}/>, document.querySelector('#app'));
}

render();

get('/api/info', data => {
    localStorage.setItem('info', JSON.stringify(data) || '[]');
    render();
});

get('/api/info/progress', progress => {
    localStorage.setItem('progress', JSON.stringify(progress) || '[]');
    render();
});
