'use strict';

const e = React.createElement;

class ChecklistItem extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            id: props.id,
            text: props.text,
        };
    }

    render() {
        var text = this.state.text;

        if (this.props.checked) {
            text = (<del>{text}</del>);
        }

        return (
            <li className="list-group-item list-group-item-action d-flex justify-content-between align-items-baseline">
                <span>
                    <input
                        className="form-check-input me-2"
                        type="checkbox"
                        checked={this.props.checked}
                        onChange={() => { this.props.toggle(this.state.id) }} />
                    <p className="d-inline">{text}</p>
                </span>
                <i className="bi bi-x" role="button" onClick={() => this.props.remove(this.state.id)}></i>
                {/* <button className="btn btn-link" onClick={() => this.props.remove(this.state.id)} >delete</button> */}
            </li>
        );
    }
}

class ItemCreator extends React.Component {
    constructor(props) {
        super(props);
        this.textInput = React.createRef();
    }

    render() {
        if (this.props.show)
            return (
                <li className="list-group-item list-group-item-action d-flex justify-content-between align-items-center">
                    <input className="form-control w-75" ref={this.textInput} type="text"></input>
                    <button className="btn btn-link" onClick={() => this.props.create(this.textInput.current.value)}>Save</button>
                </li>
            )
        return null
    }

}


class Checklist extends React.Component {
    constructor(props) {
        super(props);
        var savedState = localStorage.getItem(props.id);
        if (savedState) {
            this.state = JSON.parse(savedState);
        } else {
            this.state = {
                id: props.id,
                title: props.title,
                items: [],
                creatingItem: false
            };
        }

        // Binds
        this.removeItem = this.removeItem.bind(this);
        this.toggleCreateItem = this.toggleCreateItem.bind(this);
        this.createItem = this.createItem.bind(this);
        this.toggleItemChecked = this.toggleItemChecked.bind(this);
    }

    componentDidMount() {
        localStorage.setItem(this.props.id, JSON.stringify(this.state));
    }

    componentDidUpdate() {
        localStorage.setItem(this.props.id, JSON.stringify(this.state));
    }

    removeItem(id) {
        var items = this.state.items.filter((value, key) => {
            if (key !== id)
                return value;
        });
        this.setState({ items });
    }

    toggleCreateItem() {
        this.setState(prevState => ({
            creatingItem: !prevState.creatingItem
        }));
    }

    createItem(text) {
        var items = this.state.items;
        items.push([text, false]);
        this.setState({ items });
        this.toggleCreateItem();
    }

    toggleItemChecked(id) {
        var items = this.state.items;
        items[id][1] = !items[id][1];
        this.setState({ items });
    }

    render() {
        if (this.state.liked) {
            return 'You liked this.';
        }

        var createItemText = this.state.creatingItem ? "bi bi-x-circle" : "bi bi-plus-circle"
        return (
            <div className="col p-2 m-2 border border-1 rounded">
                <div className="d-flex justify-content-between align-items-center">
                    <h1>{this.state.title}</h1>
                    <i role="button" onClick={() => this.props.delete(this.props.id)} className="bi bi-trash"></i>
                </div>
                {
                    this.state.items.length == 0 ? <p className="text-muted lead">Empty...</p> : null
                }
                <ul className="list-group">
                    {
                        this.state.items.map((item, key) => <ChecklistItem key={key + item.toString()} remove={this.removeItem} id={key} text={item[0]} checked={item[1]} toggle={this.toggleItemChecked} />)
                    }
                    <ItemCreator show={this.state.creatingItem} create={this.createItem} />
                </ul>
                <div className="d-flex justify-content-evenly my-2">
                    <i className={createItemText} role="button" onClick={this.toggleCreateItem}></i>
                    {/* <button className={"btn btn-outline-light"} onClick={this.toggleCreateItem}><i className={createItemText}></i></button>             */}
                </div>
            </div>
        );
    }
}

class ChecklistsWrapper extends React.Component {
    constructor(props) {
        super(props);

        // Binds
        this.createList = this.createList.bind(this);
        this.deleteList = this.deleteList.bind(this);

        var savedChecklists = localStorage.getItem("checklists");
        var checklists = [];
        var checklistsIndex = [];

        if (savedChecklists) {
            savedChecklists = savedChecklists.split(",");
            checklistsIndex = savedChecklists.map(id => Number.parseInt(id));
            checklists = checklistsIndex.map(id => <Checklist key={id} id={id} delete={this.deleteList} />)
        }

        this.state = { checklists, checklistsIndex };

    }

    createList() {
        var listName = prompt("List name");
        if (listName) {

            var listId = 0;
            if (this.state.checklistsIndex.length) {
                listId = Math.max(...this.state.checklistsIndex) + 1;
            }

            var checklists = this.state.checklists;
            checklists.push(<Checklist key={listId} delete={this.deleteList} id={listId} title={listName} />);

            var checklistsIndex = this.state.checklistsIndex;
            checklistsIndex.push(listId);

            this.setState({ checklists, checklistsIndex });

            localStorage.setItem("checklists", checklistsIndex);
        }
    }

    deleteList(listId) {
        var confirmation = window.confirm("Are you sure?");
        if (confirmation) {
            var checklistsIndex = this.state.checklistsIndex.filter(id => id !== listId);
            var checklists = checklistsIndex.map(id => <Checklist key={id} delete={this.deleteList} id={id} />);

            this.setState({ checklists, checklistsIndex });

            localStorage.removeItem(listId);
            localStorage.setItem("checklists", checklistsIndex);
        }
    }


    render() {
        return (
            <div>
                <div className="sidenav text-center d-flex align-items-center justify-content-center">
                    <p className="display-4">OpenLists</p>
                </div>

                <div className="main p-5">
                    <div className="d-flex justify-content-end">
                        {/* <p className="display-1"><strong>OpenLists</strong></p> */}
                        <button className="btn btn-outline-primary" onClick={this.createList}>New list</button>
                    </div>
                    <div className="container">
                        <div className="row row-cols-3 justify-content-md-center">
                            {
                                this.state.checklists.map(x => x)
                            }
                        {
                            this.state.checklists.length == 0 ? (
                                <div className="d-flex align-items-center justify-content-center" style={{height:"80vh"}}>
                                    <p className="lead text-center">No Checklists<br />Click on "New list"</p>
                                </div>
                            ) : null
                        }
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

const domContainer = document.querySelector('#checklist_container');
ReactDOM.render(<ChecklistsWrapper />, domContainer);